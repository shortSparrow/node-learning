import express from "express";
import { loginController } from "./login.controller";
import { logoutController } from "./logout.controller";
import { authentication } from "../../middleware/authentication";


const authRoute = express.Router()

authRoute.post('/login', loginController)
authRoute.get('/logout', authentication, logoutController)

export default authRoute