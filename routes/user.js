var express = require("express");
const DButils = require("../SQL/DButils");
const axios = require("axios");
var express = require("express");
var recipes = require('./recipes.js');
const api_domain = "https://api.spoonacular.com/recipes";
var router = express.Router();
//middleware aouthentication 
router.use(function (req, res, next) {
  try {
    if (req.session && req.session.user_id) {
      DButils.execQuery("SELECT user_id FROM users")
        .then((users) => {
          if (users.find((x) => x.user_id === req.session.user_id)) {
            req.user_id = req.session.user_id;
          }
          next();//success
        })
        .catch((error) => next(error));
    } else {
      throw { status: 401, message: "unauthorized" };
    }
  } catch (error) {
    next(error);
  }
});

//update profile image for user
router.put('/profilePicture/:url', async (req, res, next) => {
  try {
    if (!req.params.url) {
      throw { status: 400, message: "Bad request" };
    }
    await DButils.execQuery(
      `update users set profile_image='${req.params.url}' where user_id='${req.user_id}'`
    )
    res.status(200).send({ message: "Profile picture successfully updated", success: true });
  } catch (error) {
    next(error);
  }


});
//get last 3 views of recipes
router.get("/myWatch", async (req, res, next) => {
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
router.post('/myWatch', async (req, res, next) => {
  let userID = req.user_id;
  try {
    let recipeID = JSON.parse(req.body.recipeID);
    if (!recipeID || typeof recipeID !== 'number') {
      throw { status: 400, message: "Bad request" };
    }
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
//get if the user watch in recipe and if recipe is  a favorite
router.get('/search/:recipes', async (req, res, next) => {
  let userID = req.user_id;
  try {
    let recipes = JSON.parse(req.params.recipes);
    if (!recipes || !Array.isArray(recipes)) {
      throw { status: 400, message: "Bad request" };
    }
    let promise = [];
    recipes.map((recipeID) => { promise.push(checkWatchAndFavorite(recipeID, userID)) });
    let ans = await Promise.all(promise);
    res.status(200).send(ans);
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
      let familyRecipe = await DButils.execQuery(
        `SELECT * FROM family_recipes where user_id='${req.user_id}'`
      )
      ingredientsArrToClient(familyRecipe);
      let information = getFamilyRecipeInfomation(familyRecipe);
      res.status(200).send({ message: information, success: true });
    } catch (error) {
      next(error);
    }
  });

  // post my recipes
  router.post("/myRecipes", async (req, res, next) => {
    try {
      if (req.body) {
        let ingredients_quentity = JSON.stringify(ingredientsArrToDB(req));
        await DButils.execQuery(
          `INSERT INTO my_recipes (user_id,recipe_name,duration,vegan,gluten,ingredients_and_quantity,instruction,dishes)
            VALUES('${req.user_id}','${req.body.recipe_name}','${req.body.duration}','${booleanToString(req.body.vegan)}','${booleanToString(req.body.gluten)}','${ingredients_quentity}','${req.body.instruction}','${req.body.dishes}')`
        )
        res.status(200).send({ message: "post recipe successed", success: true });
      } else {
        next(error);
      }
    } catch (error) {
      next(error);
    }

  })

  // get my recipes
  router.get("/myRecipes", async (req, res, next) => {
    try {
      let arr = [];
      let myFamilyRecipes = await DButils.execQuery(
        `SELECT * FROM my_recipes where user_id='${req.user_id}'`
      )
      ingredientsArrToClient(myFamilyRecipes);
      let information =getMyRecipesInformation(myFamilyRecipes);
      res.status(200).send({ message: information, success: true });
    } catch (error) {
      next(error);
    }
  });

  async function  checkWatchAndFavorite(recipeID, userID) {
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
  //get favirite recipe foe user id
  router.get("/myFavoriteRecipes", async (req, res, next) => {
    let userID = req.user_id;
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
  router.get('/userInformation', async (req, res, next) => {
    try {
      const user = (
        await DButils.execQuery(
          `SELECT * FROM users WHERE user_id = '${req.user_id}'`
        )
      )[0];
      let userInfo = {
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        country: user.country,
        email: user.email,
        profilePicture: user.profile_image
      }
      res.status(200).send(userInfo);
    } catch (error) {
      next(error);
    }
  });

  //add recipe to user favorite recipes list
  router.post('/myFavoriteRecipes', async (req, res, next) => {
    let userID = req.user_id;

    try {
      let recipeID = JSON.parse(req.body.recipeID);

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

  //remove favorite recipe from user list
  router.delete('/myFavoriteRecipes/:recipeID', async (req, res, next) => {
    let userID = req.user_id;
    try {
      let recipeID = JSON.parse(req.params.recipeID);
      await DButils.execQuery(
        `delete from favorite_recipes where recipe_id= '${recipeID}' and user_id='${userID}'`
      );
      res.status(200).send({ message: "The recipe was successfully remove from favorites ", success: true });
    } catch (error) {
      next(error);
    }
  });
    //logout and clear session
    router.post("/logout", function (req, res, next) {
      try {
        req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
      } catch (error) {
        next(error);
      }
  
      res.status(200).send({ success: true, message: "logout succeeded" });
  
    });
  //parse boolean to db tables
  function booleanToString(value) {
    if (value === "true") {
      return "1";
    } else return "0";
  }
  function stringToBoolean(value) {
    if (value == 1) {
      return true;
    }
    return false;


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
        var units = values[0].split(" ");
        arr.push({ name: keys[0], quantity: units[0], unit: units[1] });
      })
      obj.ingredients_and_quantity = arr;
    })
  }
  //parse ingredient to db tables
  function ingredientsArrToDB(request) {
    let arr = [];
    request.body.ingredients_and_quantity.forEach((element) => { arr.push({ [element.name]: element.quantity + " " + element.unit }); });
    return arr;
  }
  
  function getFamilyRecipeInfomation(familyRecipe) {
    let information = familyRecipe.map((info) => {
      const {
        recipe_id,
        recipe_image,
        owner,
        recipe_name,
        duration,
        recipe_event,
        instruction,
        dishes,
        ingredients_and_quantity
      } = info;
  
      return {
        recipeID: recipe_id,
        imageURL: recipe_image,
        name: recipe_name,
        owner: owner,
        cookingDuration: duration,
        ingredients: ingredients_and_quantity,
        event: recipe_event,
        instructions: instruction,
        dishes: dishes
      }
  
    });
    return information;
  }
  function getMyRecipesInformation(element){
    let information = element.map((info) => {
      const {
        recipe_id,
        recipe_image,
        recipe_name,
        duration,
        vegan,
        gluten,
        instruction,
        dishes,
        ingredients_and_quantity
      } = info;

      return {
        recipeID: recipe_id,
        imageURL: recipe_image,
        name: recipe_name,
        cookingDuration: duration,
        isVegan: stringToBoolean(vegan),
        isGluten: stringToBoolean(gluten),
        ingredients: ingredients_and_quantity,
        instructions: instruction,
        dishes: dishes
      }
    });
    return information;
  }

  module.exports = router;
