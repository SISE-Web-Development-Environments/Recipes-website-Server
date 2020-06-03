var express = require("express");
const DButils = require("../SQL/DButils");
const axios = require("axios");
var express = require("express");
var recipes = require('./recipes.js');
const api_domain = "https://api.spoonacular.com/recipes";
var router = express.Router();

//login check in
router.use(function requireLogin(req, res, next) {
    if (!req.user_id) {
      next({ status: 401, message: "unauthorized" });
    } else {
      next();
    }
  });
  //post my family recipes
router.post('/myFamilyRecipes', async (req, res,next) => {
  try{
    if(req.body && validParameter(req.body)){
      let ingredients_quentity = JSON.stringify(ingredientsArrToDB(req));
      let ans =await DButils.execQuery(
        `INSERT INTO family_recipes (user_id,recipe_name,owner,duration,recipe_event,ingredients_and_quantity,instruction,dishes)
        VALUES('${req.user_id}','${req.body.recipe_name}','${req.body.owner}','${req.body.duration}','${req.body.recipe_event}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
    )
    res.status(200).send({ message: ans, success: true });
    }else{
      throw { status: 400, message: "Bad request" };      
    }

  }catch(error){
    next(error);
  }
});
//get my family recipes
router.get("/myFamilyRecipes",async (req,res,next)=>{
  try{
  if(req.body){
    let ans = await DButils.execQuery(
        `SELECT * FROM family_recipes where user_id='${req.user_id}'`
        )
        ingredientsArrToClient(ans);

    res.status(200).send({ message: ans, success: true });
  }else{
    throw { status: 400, message: "Bad request" };      }
  }catch(error){
    next(error);
  }
})
//post my recipes
  router.post("/myRecipes",async (req,res,next)=>{
      try{
      if(req.body && !validParameter(req.bo)){
        let ingredients_quentity = JSON.stringify(ingredientsArrToDB(req));
        await DButils.execQuery(
            `INSERT INTO my_recipes (user_id,recipe_name,duration,vegan,gluten,vegetarian,ingredients_and_quantity,instruction,dishes)
            VALUES('${req.user_id}','${req.body.recipe_name}','${req.body.duration}','${booleanToString(req.body.vegan)}','${booleanToString(req.body.gluten)}','${booleanToString(req.body.vegetarian)}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
        )          
        res.status(200).send({ message: "post recipe successed", success: true });
      }else{
        throw { status: 401, message: "not allow" };      }
    }catch{
        next(error);
      }

  })
  //get my recipes
  router.get("/myRecipes",async (req,res,next)=>{
    try{
    if(req.body){
      let arr=[];
      let ans = await DButils.execQuery(
          `SELECT * FROM my_recipes where user_id='${req.user_id}'`
          )
          ingredientsArrToClient(ans);
      res.status(200).send({ message: ans, success: true });
    }else{
      throw { status: 401, message: "not allow" };   
       }
  }catch(error){
      next(error);
    }
})
//parse boolean to db tables
function booleanToString(value){
if(value==="true"){
  return "1";
}else return "0";
}
//parse ingredient array to client 
function ingredientsArrToClient(array){
  let arr=[];
  array.map((obj)=>{
    obj.ingredients_and_quantity=JSON.parse(obj.ingredients_and_quantity);
    arr=[];
    obj.ingredients_and_quantity.map((el,index)=>{
      var keys = Object.keys( el );
      var values = Object.values( el );
      var units=values[0].split(" ");
        arr.push({name:keys[0],quantity:units[0],unit:units[1]});
    })
    obj.ingredients_and_quantity=arr;
  })
}
//parse ingredient to db tables
function ingredientsArrToDB(request){
  let arr=[];
  request.body.ingredients_and_quantity.forEach(element => {arr.push({[element.name]:element.quantity+" "+ element.unit});});
  return arr;
}
function validParameter(body){
  var keys = Object.keys( body );
  keys.map((obj)=>{
    switch(obj) {
      case "recipe_name":
        if(typeof body.recipe_name !=='string'){
          return false;
        }
        break;
      case "duration":
        if(typeof body.duration !=='number'){
          return false;
        }
        break;
      case "vegan":
          if(typeof body.vegan !=='string' || body.vegan!='true' || body.vegan!='false' ){
            return false;
          }
          break;
      case "gluten":
        if(typeof body.gluten !=='string' || body.gluten!='true' || body.gluten!='false' ){
          return false;
        }
        break;
      case "ingredients_and_quantity":
        if(typeof body.ingredients_and_quantity !=='object' || body.ingredients_and_quantity.size<1){
          return false;
        }
        break;
      case "instruction":
        if(typeof body.instruction !=='string'){
          return false;
        }
        break;
      case "dishes":
        if(typeof body.dishes !=='number'){
          return false;
        }
        break;  
      case "vegetarian":
        if(typeof body.vegetarian !=='string' || body.vegetarian!='true' || body.vegetarian!='false' ){
          return false;
        }
        break;  
      case "owner":
        if(typeof body.owner !=='string'){
          return false;
        }
        break;
      case "recipe_event":
        if(typeof body.recipe_event !=='string'){
          return false;
        }
        break;
        default:
          return false;
    }
  });
  return true;
}
//logout and clear session
router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});
module.exports = router;
