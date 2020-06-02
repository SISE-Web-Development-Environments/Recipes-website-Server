var express = require("express");
const DButils = require("../SQL/DButils");

var router= express.Router();

var express = require("express");
var router= express.Router();

router.use(function requireLogin(req, res, next) {
    if (!req.user_id) {
      next({ status: 401, message: "unauthorized" });
    } else {
      next();
    }
  });


  router.post("/myRecipes",(req,res,next)=>{
      if(req.body){
        await DButils.execQuery(
            
            `INSERT INTO users (username,password,firstName,lastName,country,email)
            VALUES('${req.body.username}','${hash_password}','${req.body.firstName}','${req.body.lastName}','${req.body.country}','${req.body.email}')`
        )

      }else{
          next(error);
      }

  })

module.exports=router;