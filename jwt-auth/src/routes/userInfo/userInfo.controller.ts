import { Request, RequestHandler, Response } from "express";
import { getUserByEmail } from "../../usecases/user/getUserBy";

export const userInfoController: RequestHandler = (req, res) => {
  const emailAddress = req.verifiedToken!.email

  const user = getUserByEmail(emailAddress);

  if (user === null) {
    return res.status(404).send({ error: "No such user" });
  }

  return res.send(user);
};
