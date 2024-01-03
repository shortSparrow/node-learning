const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");

require("dotenv").config();

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("Google profile: ", profile);
  done(null, profile);
}

passport.use(
  new Strategy(
    {
      callbackURL: "/auth/google/callback",
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
    },
    verifyCallback
  )
);

const app = express();

app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
  const isLoggedIn = true; // TODO

  if (!isLoggedIn) {
    return res.status(401).json({ error: "You must be log in" });
  }

  next();
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    // scope: ["email", "profile"],
    scope: ["email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate(
    "google",
    {
      failureRedirect: "/failure",
      successRedirect: "/",
      session: false,
    },

  )
);

app.get("/auth/logout", (req, res) => {});

// we expect that only authorized user can get this data, for achieve this add checkLoggedIn middleware. We can add more middlewares if we want
app.get("/secret", checkLoggedIn, (req, res) => {
  res.send("Your personal secret value is 42!");
});

app.get("/failure", (req, res) => {
  return res.send("Failed to login");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.use(express.static(path.resolve(__dirname, "public"), { maxAge: "30d" }));

/**
 * express.static стоїть в кінці після обробки всіх роутів, тому що якщо поставити до app.get("/"...) він заблочить додавання хедерів до цього роута які ідуть після express.static. Тому треба або сетити хедери до (як роблять в нормальних проєктах),або як я тут
 */
const server = https.createServer(
  {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
  },
  app
);

server.listen(PORT, () => {
  console.log("Listen server on port: ", PORT);
});
