import express from "express";
import { registerController } from "./register.controller";

const registerRoute = express.Router();
registerRoute.post("/register", registerController);

export default registerRoute