var express = require("express");
var router= express.Router();
const axios = require("axios");

const api_domain = "https://api.spoonacular.com/recipes";

//get recipe information by recipe id 
router.get("/information/:recipeID",async (req,res,next)=>{
    let recipe_id=req.params.recipeID;
    try{
    let ans = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
          includeNutrition: false,
          apiKey: process.env.spooncular_apiKey
        }
      });
      res.send({ data: ans.data.vegetarian });
    }catch(error){
        next(error);
    }
});
//get 3 random recpies 
router.get("/randomRecipes",async (req,res,next)=> {
    try{
        let ans = await axios.get(`${api_domain}/random`, {
            params: {
                limitLicense: true,
                number: 3,
                apiKey: process.env.spooncular_apiKey
              }
        });
        res.send(ans.data);
      } catch(error){
          next(error);
      }
});

router.get("/search", async (req,res,next)=>{
    try{
        console.log(req.params);
        const { query,number, cuisine, intolerances, diet } = req.body;
        let ans = await axios.get(`${api_domain}/search`, {
            params: {
                limitLicense: true,
                query: query,
                number: number,
                cuisine: cuisine,
                intolerances:intolerances,
                diet:diet,
                apiKey: process.env.spooncular_apiKey
              }
        });
        res.send(ans.data);
      } catch(error){
          next(error);
      }
})

module.exports=router;