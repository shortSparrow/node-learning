export type UserDb = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  oldRefreshTokens: string[];
};
