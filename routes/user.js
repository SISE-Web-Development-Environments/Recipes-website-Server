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

router.get("/lastViewRecipes", async (req, res, next) => {
  let userID = req.user_id;
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

//get if the user watch in recipe and if recipe is  a favorite
router.post('/search', async (req, res, next) => {
  let userID = req.user_id;
  let recipes = req.body.recipes;
  try {
    let promise = [];
    recipes.map((recipeID) => { promise.push(checkWatchAndFavorite(recipeID, userID)) });
    let ans = await Promise.all(promise);
    res.status(200).send(ans);
  } catch (error) {
    next(error);
  }
});

router.post('/addToMyWatch', async (req, res, next) => {
  let userID = req.user_id;
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

//post my family recipes
router.post('/myFamilyRecipes', async (req, res, next) => {
  try {
    if (req.body) {
      let ingredients_quentity = JSON.stringify(ingredientsArrToDB(req));
      let ans = await DButils.execQuery(
        `INSERT INTO family_recipes (user_id,recipe_name,owner,duration,recipe_event,ingredients_and_quantity,instruction,dishes)
        VALUES('${req.user_id}','${req.body.recipe_name}','${req.body.owner}','${req.body.duration}','${req.body.recipe_event}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
      )
      res.status(200).send({ message: ans, success: true });
    } else {
      throw { status: 400, message: "Bad request" };
    }

  } catch (error) {
    next(error);
  }
});

//get my family recipes
router.get("/myFamilyRecipes", async (req, res, next) => {
  try {
    if (req.body) {
      let ans = await DButils.execQuery(
        `SELECT * FROM family_recipes where user_id='${req.user_id}'`
      )
      ingredientsArrToClient(ans);

      res.status(200).send({ message: ans, success: true });
    } else {
      throw { status: 400, message: "Bad request" };
    }
  } catch (error) {
    next(error);
  }
})

//post my recipes
router.post("/myRecipes", async (req, res, next) => {
  try {
    if (req.body) {
      let ingredients_quentity = JSON.stringify(ingredientsArrToDB(req));
      await DButils.execQuery(
        `INSERT INTO my_recipes (user_id,recipe_name,duration,vegan,likes,gluten,vegetarian,ingredients_and_quantity,instruction,dishes)
            VALUES('${req.user_id}','${req.body.recipe_name}','${req.body.duration}','${booleanToString(req.body.vegan)}','0','${booleanToString(req.body.gluten)}','${booleanToString(req.body.vegetarian)}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
      )
      res.status(200).send({ message: "post recipe successed", success: true });
    } else {
      throw { status: 401, message: "not allow" };
    }
  } catch{
    next(error);
  }

})
//get my recipes
router.get("/myRecipes", async (req, res, next) => {
  try {
    if (req.body) {
      let arr = [];
      let ans = await DButils.execQuery(
        `SELECT * FROM my_recipes where user_id='${req.user_id}'`
      )
      ingredientsArrToClient(ans);
      res.status(200).send({ message: ans, success: true });
    } else {
      throw { status: 401, message: "not allow" };
    }
  } catch (error) {
    next(error);
  }
});

async function checkWatchAndFavorite(recipeID, userID) {
  let watch = await DButils.execQuery(//delete if recipe id already exist with user id
    `select * FROM watch_recipes WHERE user_id=${userID} and recipe_id=${recipeID} `
  );
  let favorite = await DButils.execQuery(//delete if recipe id already exist with user id
    `select * FROM favorite_recipes WHERE user_id=${userID} and recipe_id=${recipeID} `
  );
  let obj = {};
  obj.recipeID = recipeID;
  obj.isWatch = false;
  obj.isFavorite = false;
  if (watch.length > 0) {
    obj.isWatch = true;
  }
  if (favorite.length > 0) {
    obj.isFavorite = true;
  }
  return obj;
}

//parse boolean to db tables
function booleanToString(value) {
  if (value === "true") {
    return "1";
  } else return "0";
}
//parse ingredient array to client 
function ingredientsArrToClient(array) {
  let arr = [];
  array.map((obj) => {
    obj.ingredients_and_quantity = JSON.parse(obj.ingredients_and_quantity);
    arr = [];
    obj.ingredients_and_quantity.map((el, index) => {
      var keys = Object.keys(el);
      var values = Object.values(el);
      arr.push({ name: keys[0], quantity: values[0] });
    })
    obj.ingredients_and_quantity = arr;
  })
}
//parse ingredient to db tables
function ingredientsArrToDB(request) {
  let arr = [];
  request.body.ingredients_and_quantity.forEach(element => { arr.push({ [element.name]: element.quantity }); });
  return arr;
}
//logout and clear session
router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});
module.exports = router;
