import { UserDb } from "../data/models/user";
import { ResponseUser } from "../models/user/user";

export class UserMapper {
  static userDbToUser = (userDb: UserDb): ResponseUser => ({
    id: userDb.id,
    email: userDb.email,
    name: userDb.name,
    role: userDb.role,
  });
}
