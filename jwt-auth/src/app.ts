import express, { Express } from "express";
import path from "path";
import dotenv from "dotenv";
import api from './routes/api'
import cookieParser from 'cookie-parser'


dotenv.config();

export const constants = {
    REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY ?? '',
    ACCESS_TOKEN_SECRET_KEY: process.env.ACCESS_TOKEN_SECRET_KEY ?? ''
}
const app: Express = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cookieParser());

app.use(api);

export default app
