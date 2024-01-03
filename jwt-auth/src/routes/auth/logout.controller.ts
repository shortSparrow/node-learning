import { Request, Response } from "express";
import { resetAllRefreshTokens } from "../../usecases/user/resetAllRefreshTokens";

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");

  const email = req.verifiedToken!.email;
  resetAllRefreshTokens(email);

  res.sendStatus(204);
};
