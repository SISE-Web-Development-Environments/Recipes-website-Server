var express = require("express");
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
  
module.exports=router;