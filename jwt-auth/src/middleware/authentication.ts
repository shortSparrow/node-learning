import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { constants } from "../app";
import { AuthToken } from "../..";

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  const accessToken = authHeader?.split(" ")[1];
  const tokenIsNotBearer = authHeader?.split(" ")[0] !== "Bearer";
  if (!accessToken || tokenIsNotBearer) {
    return res.status(401).send("Access Denied. No token or token is invalid");
  }

  jwt.verify(
    accessToken,
    constants.ACCESS_TOKEN_SECRET_KEY,
    (error, decoded) => {
      if (error) {
        return res
          .status(401)
          .send("Access Denied. No token or token is expired");
      }

      const decodedToken = decoded as AuthToken;
      if (!decodedToken.email) {
        return res.status(402).send("Token invalid");
      }

      req.verifiedToken = decodedToken;
      next()
    }
  );
};
