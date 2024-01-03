import express from "express";
import { userInfoController } from "./userInfo.controller";
import { authentication } from "../../middleware/authentication";

const userInfoRoute = express.Router();

userInfoRoute.get("/user-info", authentication, userInfoController);

export default userInfoRoute;
