import { UserDb } from "../../data/models/user";
import { users } from "../../data/users";
import { UserMapper } from "../../mapper/userMapper";
import { ResponseUser } from "../../models/user/user";

export const getUserById = (id: string): ResponseUser | null => {
  const user = users.find((user) => user.id === id);

  if (!user) {
    return null;
  }

  return UserMapper.userDbToUser(user);
};

export const getUserByEmail = (email: string): ResponseUser | null => {
  const user = users.find((user) => user.email === email);

  if (!user) {
    return null;
  }

  return UserMapper.userDbToUser(user);
};

export const getUserDbByEmail = (email: string): UserDb | null => {
  const user = users.find((user) => user.email === email);

  if (!user) {
    return null;
  }

  return user;
};
