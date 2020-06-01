var express = require("express");
const bcrypt = require("bcrypt");
const DButils = require("../SQL/DButils");
var router= express.Router();

router.post("/login", async (req, res, next) => {
    try {
      // check that username exists
      const users = await DButils.execQuery("SELECT username FROM dbo.users");

      if (!users.find((x) => x.username === req.body.username))
        throw { status: 401, message: "Username or Password incorrect" };
  
      // check that the password is correct
      const user = (
        await DButils.execQuery(
          `SELECT * FROM users WHERE username = '${req.body.username}'`
        )
      )[0];

      if (!bcrypt.compareSync(req.body.password, user.password)) {
        throw { status: 401, message: "Username or Password incorrect" };
      }
  
      // Set cookie
      req.session.username = user.user_id;
      // req.session.save();
      // res.cookie(session_options.cookieName, user.user_id, cookies_options);
  
      // return cookie
      res.status(200).send({ message: "login successed", success: true });
    } catch (error) {
      next(error);
    }
  });

router.post("/register", async (req,res,next) => {
    try{
    const user = (
        await DButils.execQuery(
          `SELECT * FROM users WHERE username = '${req.body.username}'`
        )
      )[0];
      if(user){
        throw { status: 409, message: "Username already in use" };
      }else{
        let hash_password = bcrypt.hashSync(
            req.body.password,
            parseInt(process.env.bcrypt_saltRounds)
          );

          await DButils.execQuery(
              `INSERT INTO users (username,password,firstName,lastName,country,email)
              VALUES('${req.body.username}','${hash_password}','${req.body.firstName}','${req.body.lastName}','${req.body.country}','${req.body.email}')`
          )
          res.status(201).send({ message: "register successed", success: true });
      }
    }catch(error){
        next(error);
      }
});
module.exports=router;