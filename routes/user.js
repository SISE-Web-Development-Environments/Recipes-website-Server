var express = require("express");
const DButils = require("../SQL/DButils");
const axios = require("axios");
var express = require("express");
var recipes = require('./recipes.js');
const api_domain = "https://api.spoonacular.com/recipes";
var router = express.Router();

router.use(function requireLogin(req, res, next) {
  if (!req.session.user_id) {
    next({ status: 401, message: "unauthorized" });
  } else {
    next();
  }
});

//get favirite recipe foe user id
router.get("/myFavoriteRecipes", async (req, res, next) => {
  let userID = req.body.user;
  try {
    let favorites = await DButils.execQuery(
      `SELECT recipe_id FROM favorite_recipes WHERE user_id= '${userID}'`
    )
    let urlList = [];
    //create url for all recipe id
    favorites.map((recipeID) => urlList.push(`${api_domain}/${recipeID.recipe_id}/information?apiKey=${process.env.spooncular_apiKey}`));
    //sending request to external api
    let infoResponse = await recipes.promiseAll(axios.get, urlList);
    //extract data to array
    let infoResponseData = [];
    infoResponse.map((info) => infoResponseData.push(info.data));
    //extract relevant informaiton for client
    let relevantInfoResponse = recipes.getRelevantRecipeDateShow(infoResponseData);
    //sending response
    res.status(200).send(relevantInfoResponse);
  } catch (error) {
    next(error);
  }
});

//add recipe to user favorite recipes list
router.post('/myFavoriteRecipes', async (req, res, next) => {
  let userID = req.body.user;
  let recipeID = req.body.recipeID;

  try {
    let isExist = await DButils.execQuery(
      `select * from favorite_recipes where recipe_id= ${recipeID} and user_id=${userID}`
    );
    if (isExist.length == 0) {//check it is a first time
      await DButils.execQuery(
        `INSERT INTO favorite_recipes(user_id,recipe_id) VALUES(${userID},${recipeID})`
      );
    }
    res.status(200).send({ message: "The recipe was successfully added to favorites ", success: true });
  } catch (error) {
    next(error);
  }

});

router.get("/lastViewRecipes", async (req, res, next) => {
  let userID = req.body.user;
  try {
    let recipesIDList = await DButils.execQuery(
      `select top(3) recipe_id
       from watch_recipes 
       where user_id=${userID} 
       order by index_watch_id desc `
    );
    let urlList = [];
    //create url for all recipe id
    recipesIDList.map((recipeID) => urlList.push(`${api_domain}/${recipeID.recipe_id}/information?apiKey=${process.env.spooncular_apiKey}`));
    //sending request to external api
    let infoResponse = await recipes.promiseAll(axios.get, urlList);
    //extract data to array
    let infoResponseData = [];
    infoResponse.map((info) => infoResponseData.push(info.data));
    //extract relevant informaiton for client
    let relevantInfoResponse = recipes.getRelevantRecipeDateShow(infoResponseData);
    //sending response
    res.status(200).send(relevantInfoResponse);

  } catch (error) {
    next(error);
  }
})

router.post('/addToMyWatch', async (req, res, next) => {
  let userID = req.body.user;
  let recipeID = req.body.recipeID;
  try {
    await DButils.execQuery(//delete if recipe id already exist with user id
      `DELETE FROM  watch_recipes WHERE user_id=${userID} and recipe_id=${recipeID} `
    );
    await DButils.execQuery(
      `INSERT INTO watch_recipes(user_id,recipe_id) VALUES(${userID},${recipeID})`
    );
    res.status(200).send({ message: "The recipe was successfully added to my watch ", success: true });
  } catch (error) {
    next(error);
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
});

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

  });

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
      throw { status: 401, message: "not allow" };   
       }
  }catch(error){
      next(error);
    }
});

module.exports = router;
