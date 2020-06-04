var express = require("express");
const axios = require("axios");
var router = express.Router();
const api_domain = "https://api.spoonacular.com/recipes";

//get recipe information by recipe id 
router.get("/information/:recipeID", async (req, res, next) => {
    let recipe_id = req.params.recipeID;

    
    try {
        if(!recipe_id){
            throw { status: 400, message: "Bad request" };

        }
        let infoResponse = await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.spooncular_apiKey
            }
        });

        //extract relevant informaiton
        let relevantInfoResponse = getRelevantRecipeDateInformation(infoResponse);
        res.status(200).send(relevantInfoResponse);
    } catch (error) {
        next(error);
    }
})


//get 3 random recpies 
router.get("/randomRecipes", async (req, res, next) => {
    try {
        let ans = await axios.get(`${api_domain}/random`, {
            params: {
                limitLicense: true,
                number: 3,
                apiKey: process.env.spooncular_apiKey
            }
        });

        //extract relevant informaiton for client
        let relevantInfoResponse = getRelevantRecipeDateShow(ans.data.recipes);
        //sending response
        res.status(200).send(relevantInfoResponse);
    } catch (error) {
        next(error);
    }
})

//get showing inforamation for search recipes
router.get("/search", async (req, res, next) => {
    try {
        if(!req.query.number){
            req.query.number=5;
        }
        let ans = await axios.get(`${api_domain}/search`, {
            params: {
                limitLicense: true,
                query: req.query.query,
                number: req.query.number,
                cuisine: req.query.cuisine,
                intolerances: req.query.intolerances,
                diet: req.query.diet,
                apiKey: process.env.spooncular_apiKey
            }
        });
        //create array recipes id
        let data = getArrayRecipeID(ans.data);
        let urlList = [];
        //create url for all recipe id
        data.map((recipeID) => urlList.push(`${api_domain}/${recipeID}/information?apiKey=${process.env.spooncular_apiKey}`));
        //sending request to external api
        let infoResponse = await promiseAll(axios.get, urlList);
        //extract data to array
        let infoResponseData=[];
        infoResponse.map((info)=> infoResponseData.push(info.data));
        //extract relevant informaiton for client
        let relevantInfoResponse = getRelevantRecipeDateShow(infoResponseData);
        //sending response
        res.status(200).send(relevantInfoResponse);
    } catch (error) {
        next(error);
    }
})


//waiting for all promises return
async function promiseAll(func, urlList) {
    let promises = [];
    urlList.map((url) => promises.push(func(url)));
    let info = await Promise.all(promises);
    return info;
}

//extract relevant recipe data from api response for show
function getRelevantRecipeDateShow(infoList) {
    return infoList.map((info) => {
        const {
            id,
            image,
            title,
            readyInMinutes,
            aggregateLikes,
            vegetarian,
            vegan,
            glutenFree,
        } = info;

        return {
            recipeID: id,
            imageURL: image,
            name: title,
            cookingDuration: readyInMinutes,
            likes: aggregateLikes,
            isVegeterian: vegetarian,
            isVegan: vegan,
            isGluten: glutenFree
        }
    });
}

//extract relevant recipe data from api response for get information
function getRelevantRecipeDateInformation(info) {
    const {
        id,
        image,
        title,
        readyInMinutes,
        aggregateLikes,
        vegetarian,
        vegan,
        glutenFree,
        extendedIngredients,
        instructions,
        servings
    } = info.data;
    var Ingredients=[];

    extendedIngredients.map((ing)=>{
        let obj={};
        obj.name= ing.name;
        obj.qauntity= ing.amount;
        obj.unit=ing.unit;
        Ingredients.push(obj);
    })

    return {
        recipeID: id,
        imageURL: image,
        name: title,
        cookingDuration: readyInMinutes,
        likes: aggregateLikes,
        isVegeterian: vegetarian,
        isVegan: vegan,
        isGluten: glutenFree,
        ingredients: Ingredients,
        cookingInstruction: instructions,
        dishesNumber: servings
    }
}

//get array of all recipes that return from search api
function getArrayRecipeID(data) {
    let recipeIDs = [];
    data.results.map((recipe) => { recipeIDs.push(recipe.id); });
    return recipeIDs;
}
module.exports = { 
    router:router,
    promiseAll:promiseAll,
    getRelevantRecipeDateShow:getRelevantRecipeDateShow,
    getRelevantRecipeDateInformation:getRelevantRecipeDateInformation,
    getArrayRecipeID:getArrayRecipeID
  }
