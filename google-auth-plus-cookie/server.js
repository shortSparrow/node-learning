const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

require("dotenv").config();

const PORT = 3000;

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
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

// Save the session to cookie. Схоже що user це дані з гугла (ті які з verifyCallback)
passport.serializeUser((user, done) => {
  console.log("serializeUser: ", user);
  done(null, user.id);
});

// Read the session from the cookie (викликається на кожен запит)
passport.deserializeUser((obj, done) => {
  console.log("deserializeUser: ", obj);
  done(null, obj);
});

const app = express();

app.use(helmet());
app.use(
  cookieSession({
    name: "session",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2], // signing cookie for security
  })
);
app.use(passport.initialize());
app.use(passport.session()); // uses keys and validates that all signs as should be. Я так розумію викличе функцію deserializeUser

function checkLoggedIn(req, res, next) {
  // req.user - probably gos from passport.session()
  console.log("req.user: ", req.user);
  console.log("req.isAuthenticated: ", req.isAuthenticated());
  const isLoggedIn = req.isAuthenticated() && req.user;

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
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true,
  })
);

app.get("/auth/logout", (req, res) => {
  req.logout(); // this function comes from passport. Removes req.user and clear any logged in session

  return res.redirect("/");
});

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
