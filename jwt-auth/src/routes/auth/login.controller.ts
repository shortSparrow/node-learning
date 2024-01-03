import Joi from "joi";
import bcrypt from "bcrypt";

import { Request, Response } from "express";
import { getUserDbByEmail } from "../../usecases/user/getUserBy";
import { generateAccessToken } from "../../usecases/tokens/generateAccessToken";
import { generateRefreshToken } from "../../usecases/tokens/generateRefreshToken";
import { UserMapper } from "../../mapper/userMapper";
import { resetAllRefreshTokens } from "../../usecases/user/resetAllRefreshTokens";
import { addNewRefreshToken } from "../../usecases/user/addNewRefreshToken";

const loginValidationSchema = Joi.object({
  email: Joi.string().email().max(50).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;

  const validationResult = loginValidationSchema.validate({ email, password });

  if (validationResult.error) {
    return res.status(400).send({ error: "invalid email or password" });
  }

  const user = getUserDbByEmail(req.body.email);

  if (!user) {
    return res.status(404).send({ error: "This user does not exist" });
  }

  const isPasswordMatch = bcrypt.compareSync(password, user.password);

  if (!isPasswordMatch) {
    return res.status(401);
  }

  const accessToken = generateAccessToken(user.email);
  const refreshToken = generateRefreshToken(user.email);
  resetAllRefreshTokens(user.email)
  
  addNewRefreshToken(refreshToken, user.email);

  return res
    .cookie("refreshToken", refreshToken, {
      secure: true,
      httpOnly: true,
      path: "/get-new-access-token",
    })
    .send({ ...UserMapper.userDbToUser(user), accessToken });
};
