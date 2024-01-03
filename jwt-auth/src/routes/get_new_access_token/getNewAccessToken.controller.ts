import { Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { constants } from "../../app";
import { generateRefreshToken } from "../../usecases/tokens/generateRefreshToken";
import { generateAccessToken } from "../../usecases/tokens/generateAccessToken";
import { getUserDbByEmail } from "../../usecases/user/getUserBy";

import { addNewRefreshToken } from "../../usecases/user/addNewRefreshToken";
import { UserMapper } from "../../mapper/userMapper";
import { resetAllRefreshTokens } from "../../usecases/user/resetAllRefreshTokens";

export const getNewAccessTokenController = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);
  const refreshToken: string = cookies.refreshToken.toString();

  jwt.verify(
    refreshToken,
    constants.REFRESH_TOKEN_SECRET_KEY,
    (err, decoded) => {
      if (err) {
        if (err instanceof TokenExpiredError) {
          // на випадок якщо користувач довго не заходив в апку і у нього протух як access так і refresh
          return res.status(401).send({ error: "user is unauthorized" });
        }
        return res.status(403).send({ error: "Token is not valid" });
      }

      const email = (decoded as any).email;

      const user = getUserDbByEmail(email);
      if (user === null) {
        return res.status(404).send({ error: "user not found" });
      }

      const isTokenExistInDB = user.oldRefreshTokens.find(
        (token) => token === refreshToken
      );

      if (!isTokenExistInDB) {
        // Potential that token was steal. We don't care who call api now - user or attacker. Just reset all refresh tokens
        resetAllRefreshTokens(user.email);
        return res.status(401).send({ error: "Invalid token" });
      }

      const newRefreshToken = generateRefreshToken(email);
      const newAccessToken = generateAccessToken(email);

      resetAllRefreshTokens(user.email);
      addNewRefreshToken(newRefreshToken, user.email);

      return res
        .cookie("refreshToken", newRefreshToken, {
          secure: true,
          httpOnly: true,
          path: "/get-new-access-token",
        })
        .send({
          ...UserMapper.userDbToUser(user),
          accessToken: newAccessToken,
        });
    }
  );
};
