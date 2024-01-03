import express from "express";

export type AuthToken = { email: string };

// TODO figure out how to better, this approach or just make as MyRequestType in cases where is needed
declare module "express-serve-static-core" {
  interface Request {
    verifiedToken?: AuthToken;
  }
}
