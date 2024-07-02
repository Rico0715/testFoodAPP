const admin = require('firebase-admin');
const functions = require('firebase-functions-test')();
const myFunctions = require('../functions/index');
const { setupFirestore, teardownFirestore } = require('../jest.setup');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

jest.setTimeout(70000); // Augmenter le timeout des tests à 70000 ms

describe('addFavoriteRecipe', () => {
    let db;
  
    beforeAll(async () => {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, 'testApp');
  
      db = admin.firestore();
      await setupFirestore();
    });
  
    afterAll(async () => {
      await teardownFirestore();
      // Nettoyer l'environnement après les tests
      functions.cleanup();
    });

  it('should add a recipe to favorites when userId and recipe are provided', async () => {
    const req = {
      body: {
        userId: 'testUserId',
        recipe: {
          recipeId: 'testRecipeId',
          title: 'Test Recipe',
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          instructions: 'Test instructions'
        }
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await myFunctions.addFavoriteRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Recipe added to favorites');

    // Verify Firestore interactions
    const docRef = db.collection('favoriteRecipes').doc('testUserId');
    const updateSpy = jest.spyOn(docRef, 'update');
    expect(updateSpy).toHaveBeenCalledWith({
      recipes: admin.firestore.FieldValue.arrayUnion(req.body.recipe)
    });
  });

  it('should create a new document and add recipe to favorites when document does not exist', async () => {
    const req = {
      body: {
        userId: 'testUserId',
        recipe: {
          recipeId: 'testRecipeId',
          title: 'Test Recipe',
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          instructions: 'Test instructions'
        }
      }
    };

    // Simulate document does not exist
    const getSpy = jest.spyOn(db.collection('favoriteRecipes').doc(), 'get');
    getSpy.mockResolvedValueOnce({ exists: false });

    const setSpy = jest.spyOn(db.collection('favoriteRecipes').doc(), 'set');

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await myFunctions.addFavoriteRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Recipe added to favorites');

    // Verify Firestore interactions
    expect(setSpy).toHaveBeenCalledWith({
      recipes: [req.body.recipe]
    });
  });

  it('should return 400 if userId or recipe is missing', async () => {
    const req = {
      body: {}
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await myFunctions.addFavoriteRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing userId or recipe');
  });

  it('should return 500 if an error occurs during Firestore operation', async () => {
    const req = {
      body: {
        userId: 'testUserId',
        recipe: {
          recipeId: 'testRecipeId',
          title: 'Test Recipe',
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          instructions: 'Test instructions'
        }
      }
    };

    // Mock Firestore update to throw an error
    const updateSpy = jest.spyOn(db.collection('favoriteRecipes').doc(), 'update');
    updateSpy.mockRejectedValueOnce(new Error('Firestore error'));

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await myFunctions.addFavoriteRecipe(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error: Firestore error');
  });
});
