import { UserMapper } from "../../mapper/userMapper";
import { v4 as uuidv4 } from "uuid";
import { ResponseUser } from "../../models/user/user";
import { UserDb } from "../../data/models/user";
import { users } from "../../data/users";

export const addNewUser = (userValue: Omit<UserDb, "id">): ResponseUser => {
  const user = { ...userValue, id: uuidv4() };
  users.push(user);

  return UserMapper.userDbToUser(user);
};
