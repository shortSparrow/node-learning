import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Joi from "joi";

import { users } from "../../data/users";
import { addNewUser } from "../../usecases/user/addNewUser";
import { generateAccessToken } from "../../usecases/tokens/generateAccessToken";
import { generateRefreshToken } from "../../usecases/tokens/generateRefreshToken";
import { addNewRefreshToken } from "../../usecases/user/addNewRefreshToken";

const validationSchema = Joi.object({
  email: Joi.string().email().max(50).required(),
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .message("Password is wrong"),
  name: Joi.string().alphanum().max(30).message("invalid name"),
});

export const registerController = (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const validationResult = validationSchema.validate({ email, password, name });

  if (validationResult.error) {
    return res.status(400).send({ error: validationResult.error.message });
  }

  const isUserExist = users.find((user) => user.email == email);
  if (isUserExist) {
    return res.status(409).send({ error: "User Already Exist" });
  }

  const encryptedPassword = bcrypt.hashSync(password, 10);

  const user = addNewUser({
    email,
    password: encryptedPassword,
    name,
    role: "user",
    oldRefreshTokens: [],
  });

  const accessToken = generateAccessToken(user.email);
  const refreshToken = generateRefreshToken(user.email);

  addNewRefreshToken(refreshToken, user.email);

  // TODO now for setting refreshToken use cookie, maybe for mobile better just return refreshToken in body
  return res
    .cookie("refreshToken", refreshToken, {
      secure: true,
      httpOnly: true,
      path: "/get-new-access-token",
    })
    .send({
      ...user,
      accessToken: accessToken,
    });
};
