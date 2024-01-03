import jwt from "jsonwebtoken";
import { constants } from "../../app";

export const generateAccessToken = (email: string) => {
  return jwt.sign({ email: email }, constants.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "1m", // in real case may be 1 hour or 0.5 day
  });
};
