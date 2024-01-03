import { users } from "../../data/users";

export const resetAllRefreshTokens = (userEmail: string) => {
  const user = users.find((user) => user.email === userEmail);
  if (user) {
    user.oldRefreshTokens = [];
  } else {
    throw new Error("There is not this user");
  }
};
