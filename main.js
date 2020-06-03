require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
const DButils = require("./SQL/DButils");

const user= require("./routes/user");
const guest= require("./routes/guest");
const recipes= require("./routes/recipes");

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 20*600 * 1000, // expired after 20 sec
    activeDuration: 0 // if expiresIn < activeDuration,
    //the session will be extended by activeDuration milliseconds
  })
);
app.use(function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      .catch((error) => next());
  } else {
    next();
  }
});
app.use("/recipes",recipes.router);
app.use("/user", user);
app.use("/guest", guest);

app.use(function (err, req, res, next) {
  // console.error(err);
  res.status(err.status || 500).send({ message: err.message||"bad", success: false });
});

var port = process.env.PORT || "3000";
const server = app.listen(port, () => {
    console.log(`Server listen on port ${port}`);
  });
