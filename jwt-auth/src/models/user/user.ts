import { UserDb } from "../../data/models/user";

export type ResponseUser = Omit<UserDb, "password" | "oldRefreshTokens">;
