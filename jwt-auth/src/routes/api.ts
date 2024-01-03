import express from "express";
import registerRoute from "./register/register.route";
import authRoute from "./auth/auth.route";
import userInfoRoute from "./userInfo/userInfo.route";
import getNewAccessTokenRoute from "./get_new_access_token/getNewAccessToken.route";

const api = express.Router();

api.use(registerRoute);
api.use(authRoute);
api.use(userInfoRoute);
api.use(getNewAccessTokenRoute);

export default api;
