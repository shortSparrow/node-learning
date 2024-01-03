import express from "express";
import { getNewAccessTokenController } from "./getNewAccessToken.controller";


const getNewAccessTokenRoute = express.Router();
getNewAccessTokenRoute.get("/get-new-access-token", getNewAccessTokenController);

export default getNewAccessTokenRoute;
