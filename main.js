require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cors = require("cors");

const session = require("client-sessions");
const DButils = require("./SQL/DButils");

const user= require("./routes/user");
const guest= require("./routes/guest");
const recipes= require("./routes/recipes");

var app = express();
app.use(logger("dev")); //logger
// cors
const corsConfig = {
  origin: true,
  credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 60*60*3*1* 1000, // expired after 3 hours
    activeDuration: 0 // if expiresIn < activeDuration,
    //the session will be extended by activeDuration milliseconds
  })
);



app.use("/recipes",recipes.router);
app.use("/guest", guest);
app.use("/user", user);

app.use(function (err, req, res, next) {
  res.status(err.status || 500).send({ message: err.message||"bad request", success: false });
});

var port = process.env.PORT || "3000";
const server = app.listen(port, () => {
    console.log(`Server listen on port ${port}`);
  });
