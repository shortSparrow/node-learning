import jwt from "jsonwebtoken";
import { constants } from "../../app";

// without Date.now() generateRefreshToken called twice at the same time return the same value
export const generateRefreshToken = (email: string) => {
  return jwt.sign(
    { email: email, timeCreated: Date.now() },
    constants.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: "1h", // in real case may be 0.5-1 month maybe
    }
  );
};
