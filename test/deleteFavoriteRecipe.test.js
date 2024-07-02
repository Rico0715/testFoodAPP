const admin = require('firebase-admin');
const functions = require('firebase-functions-test')();
const myFunctions = require('../functions/index');
const { setupFirestore, teardownFirestore } = require('../jest.setup');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

jest.setTimeout(70000); // Augmenter le timeout des tests à 70000 ms

describe('deleteFavoriteRecipe', () => {
    let db;
  
    beforeAll(async () => {
      jest.useFakeTimers('legacy')

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, 'testApp');
  
      db = admin.firestore();
      await setupFirestore();
    });
  
    afterAll(async () => {
      await teardownFirestore();
      functions.cleanup();
    });
    it('should delete a favorite recipe successfully', async () => {
        // Mock data: Add a favorite recipe for 'testUserId' to Firestore
        const testData = {
          recipes: [
            {
              recipeId: 123,
              title: 'Test Recipe',
              ingredients: ['Ingredient 1', 'Ingredient 2'],
              instructions: 'Test instructions'
            }
          ]
        };
    
        await db.collection('favoriteRecipes').doc('testUserId').set(testData);
    
        // Simulate HTTP request
        const req = {
          query: {
            userId: 'testUserId',
            recipeId: '123' // Existing recipeId as string
          }
        };
    
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
        };
    
        await myFunctions.deleteFavoriteRecipe(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('Recipe deleted successfully');
    
        // Verify Firestore interactions
        const doc = await db.collection('favoriteRecipes').doc('testUserId').get();
        expect(doc.exists).toBe(true);
        expect(doc.data().recipes.length).toBe(0); // Recipes should be empty after deletion
      });
    
      it('should return 404 if favorite recipe not found', async () => {
        // Simulate HTTP request where 'testUserId' does not have 'nonExistingRecipeId' as a favorite recipe
        const req = {
          query: {
            userId: 'testUserId',
            recipeId: 'nonExistingRecipeId' // Non-existing recipeId
          }
        };
    
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
        };
    
        await myFunctions.deleteFavoriteRecipe(req, res);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Recipe not found');
    
        // Verify Firestore interactions: Ensure no changes were made
        const doc = await db.collection('favoriteRecipes').doc('testUserId').get();
        expect(doc.exists).toBe(true); // Document should still exist
        expect(doc.data().recipes.length).toBe(1); // Recipes should remain unchanged
      });
    
      it('should return 400 if userId or recipeId is missing', async () => {
        // Simulate HTTP request with missing userId and recipeId
        const req = {
          query: {} // Missing userId and recipeId
        };
    
        const res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
        };
    
        await myFunctions.deleteFavoriteRecipe(req, res);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Missing userId or recipeId');
    
        // Verify Firestore interactions: Ensure no changes were made
        const doc = await db.collection('favoriteRecipes').doc('testUserId').get();
        expect(doc.exists).toBe(true); // Document should still exist
        expect(doc.data().recipes.length).toBe(1); // Recipes should remain unchanged
      });

});