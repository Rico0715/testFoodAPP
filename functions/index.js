/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.getFavoriteRecipes = functions.https.onRequest(async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).send('Missing userId');
  }
  
  try {
    const doc = await db.collection('favoriteRecipes').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).send('No favorite recipes found');
    }
    res.status(200).send(doc.data());
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

exports.addFavoriteRecipe = functions.https.onRequest(async (req, res) => {
  const userId = req.body.userId;
  const recipe = req.body.recipe;
  
  if (!userId || !recipe) {
    return res.status(400).send('Missing userId or recipe');
  }

  try {
    const docRef = db.collection('favoriteRecipes').doc(userId);
    const doc = await docRef.get();
    if (doc.exists) {
      await docRef.update({
        recipes: admin.firestore.FieldValue.arrayUnion(recipe)
      });
    } else {
      await docRef.set({
        recipes: [recipe]
      });
    }
    res.status(200).send('Recipe added to favorites');
  } catch (error) {
    res.status(500).send(error.toString());
  }
});



exports.updateFavoriteRecipe = functions.https.onRequest(async (req, res) => {
  const userId = req.body.userId;
  const recipeId = req.body.recipeId;
  const updateFields = req.body.updateFields;

  if (!userId || !recipeId || !updateFields) {
    return res.status(400).send('Missing userId, recipeId, or updateFields');
  }

  try {
    const docRef = db.collection('favoriteRecipes').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send('No favorite recipes found');
    }

    const recipes = doc.data().recipes;
    const recipeIndex = recipes.findIndex(recipe => recipe.recipeId === recipeId);

    if (recipeIndex === -1) {
      return res.status(404).send('Recipe not found');
    }

    recipes[recipeIndex] = {
      ...recipes[recipeIndex],
      ...updateFields
    };

    await docRef.update({ recipes });
    res.status(200).send('Recipe updated');
  } catch (error) {
    console.error('Error updating recipe: ', error);
    res.status(500).send(error.toString());
  }
});


exports.deleteFavoriteRecipe = functions.https.onRequest(async (req, res) => {
  const userId = req.query.userId;
  const recipeId = parseInt(req.query.recipeId, 10);

  if (!userId || isNaN(recipeId)) {
      console.log('Missing userId or recipeId is not a number');
      return res.status(400).send('Missing userId or recipeId');
  }

  try {
      const docRef = admin.firestore().collection('favoriteRecipes').doc(userId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
          console.log(`No document found for userId: ${userId}`);
          return res.status(404).send('No such document!');
      }

      const recipes = docSnap.data().recipes;
      console.log('Current recipes:', recipes);

      const updatedRecipes = recipes.filter(recipe => recipe.recipeId !== recipeId);
      console.log('Updated recipes after filtering:', updatedRecipes);

      if (updatedRecipes.length === recipes.length) {
          console.log(`Recipe with recipeId: ${recipeId} not found for userId: ${userId}`);
          return res.status(404).send('Recipe not found!');
      }

      await docRef.update({ recipes: updatedRecipes });
      console.log(`Recipe with recipeId: ${recipeId} deleted successfully for userId: ${userId}`);

      return res.status(200).send('Recipe deleted successfully');
  } catch (error) {
      console.error('Error deleting recipe: ', error);
      return res.status(500).send('Internal Server Error');
  }
});
