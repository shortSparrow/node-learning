import { users } from "../../data/users";

export const addNewRefreshToken = (
  refreshToken: string,
  userEmail: string
) => {
  const user = users.find((user) => user.email === userEmail);
  if (user) {
    user.oldRefreshTokens.push(refreshToken);
  } else {
    throw new Error("There is not this user");
  }
};
