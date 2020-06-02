var express = require("express");
const DButils = require("../SQL/DButils");
const axios = require("axios");
var express = require("express");
const api_domain = "https://api.spoonacular.com/recipes";
var router= express.Router();

// router.use(function requireLogin(req, res, next) {
//     if (!req.user_id) {
//       next({ status: 401, message: "unauthorized" });
//     } else {
//       next();
//     }
//   });

//   router.get("/myFavoriteRecipes",async (req,res,next)=>{
//     let useID= req.user_id;
//     try{
//       let favorites= await DButils.execQuery(
//         `SELECT recipe_id FROM favorite_recipes WHERE user_id= '${useID}'`
//       )
//       let ans;
//       for(let recipeID in favorites) {
//         let recipeInfo= getRecipeInfo(recipeID);
//         let body= getBodyRecipeInfo(recipeInfo);
//         ans.add(body);
//       }

//       res.status(201).send({ message: "register successed", success: true });
//     } catch(error){
//       next(error);
//     }

//   });

//   // router.post("/myRecipes",(req,res,next)=>{
//   //     if(req.body){
//   //       await DButils.execQuery(
            
//   //           `INSERT INTO users (username,password,firstName,lastName,country,email)
//   //           VALUES('${req.body.username}','${hash_password}','${req.body.firstName}','${req.body.lastName}','${req.body.country}','${req.body.email}')`
//   //       )

//   //     }else{
//   //         next(error);
//   //     }

//   // });

// module.exports=router;

// function getRecipeInfo(recipe_id){
//   try{
//     let ans = await axios.get(`${api_domain}/${recipe_id}/information`, {
//         params: {
//           includeNutrition: false,
//           apiKey: process.env.spooncular_apiKey
//         }
//       });
//      return ans.data;
//     }catch(error){
//         next(error);
//     }
// }

// function getBodyRecipeInfo(data){
//   return { 
//     "recipeID": data.id,
//     "imageURL": data.image,
//     "name": data.title,
//     "cookingDuration": data.readyInMinutes,
//     "likes": data.aggregateLikes,
//     "isVegeterian": data.vegetarian,
//     "isVegan": data.vegan,
//     "isGluten": data.glutenFree,
//     "ingredients":data.extendedIngredients,
//     "cookingInstruction": data.instructions,
//     "dishesNumber": data.servings
//   }
// }
module.exports = router;
