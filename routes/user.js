var express = require("express");
const DButils = require("../SQL/DButils");
const axios = require("axios");

var router= express.Router();

var express = require("express");
var router= express.Router();

router.use(function requireLogin(req, res, next) {
    if (!req.session.user_id) {
      next({ status: 401, message: "unauthorized" });
    } else {
      next();
    }
  });
router.post('/myFamilyRecipes', async (req, res,next) => {
  try{
    if(req.body){
      let ingredients_quentity = JSON.stringify(req.body.ingredients_and_quantity);
      let ans =await DButils.execQuery(
        `INSERT INTO family_recipes (user_id,recipe_name,owner,duration,recipe_event,ingredients_and_quantity,instruction,dishes)
        VALUES('${req.session.user_id}','${req.body.recipe_name}','${req.body.owner}','${req.body.duration}','${req.body.recipe_event}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
    )
    res.status(200).send({ message: ans, success: true });
    }else{
      throw { status: 400, message: "Bad request" };      
    }

  }catch(error){
    next(error);
  }
});
router.get("/myFamilyRecipes",async (req,res,next)=>{
  try{
  if(req.body){
    let ans = await DButils.execQuery(
        `SELECT * FROM family_recipes where user_id='${req.session.user_id}'`
        )
        ans.map((obj)=>{
          obj.ingredients_and_quantity=JSON.parse(obj.ingredients_and_quantity);
        })
    res.status(200).send({ message: ans, success: true });
  }else{
    throw { status: 400, message: "Bad request" };      }
  }catch(error){
    next(error);
  }
})
  router.post("/myRecipes",async (req,res,next)=>{
      try{
      if(req.body){
        let ingredients_quentity = JSON.stringify(req.body.ingredients_and_quantity);
        await DButils.execQuery(
            `INSERT INTO my_recipes (user_id,recipe_name,duration,vegan,likes,gluten,vegetarian,ingredients_and_quantity,instruction,dishes)
            VALUES('${req.session.user_id}','${req.body.recipe_name}','${req.body.duration}','${req.body.vegan}','0','${req.body.gluten}','${req.body.vegetarian}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
        )          
        res.status(200).send({ message: "post recipe successed", success: true });
      }else{
        throw { status: 401, message: "not allow" };      }
    }catch{
        next(error);
      }

  })
  router.get("/myRecipes",async (req,res,next)=>{
    try{
    if(req.body){
      let ans = await DButils.execQuery(
          `SELECT * FROM my_recipes where user_id='${req.session.user_id}'`
          )
          ans.map((obj)=>{
            obj.ingredients_and_quantity=JSON.parse(obj.ingredients_and_quantity);
            obj.ingredients_and_quantity.map((o)=>{
              console.log(o);
            })
          })
      res.status(200).send({ message: ans, success: true });
    }else{
      throw { status: 401, message: "not allow" };      }
  }catch(error){
      next(error);
    }
})


module.exports=router;