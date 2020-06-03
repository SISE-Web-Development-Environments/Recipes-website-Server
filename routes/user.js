var express = require("express");
const DButils = require("../SQL/DButils");
const axios = require("axios");
var express = require("express");
var recipes = require('./recipes.js');
const api_domain = "https://api.spoonacular.com/recipes";
var router = express.Router();


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

module.exports = router;
