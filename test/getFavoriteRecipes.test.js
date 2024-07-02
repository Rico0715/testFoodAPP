const admin = require('firebase-admin');
const functions = require('firebase-functions-test')();
const myFunctions = require('../functions/index');
const { setupFirestore, teardownFirestore } = require('../jest.setup');



const { getFavoriteRecipes } = require('../functions/index');
jest.setTimeout(70000); // Augmenter le timeout des tests à 70000 ms

describe('getFavoriteRecipes', () => {
  let db;

  beforeAll(async () => {
    
    jest.useFakeTimers('legacy')

    db = await setupFirestore();
  });

  afterAll(async () => {
    await teardownFirestore();
    functions.cleanup();
  });

  it('should return favorite recipes for a valid test user', async () => {
    debugger;
    const userId = 'testUserId';
    const testData = {
      recipes: [
        {
          instructions: "Test instructions",
          servings: 2,
          ingredients: [
            "Ingredient 1",
            "Ingredient 2"
          ],
          title: "Test Recipe",
          recipeId: "testRecipeId",
          cookingTime: 30
        }
      ]
    };

    // Ajouter des données de test à Firestore
    await db.collection('favoriteRecipes').doc(userId).set(testData);

    // Simuler une requête HTTP
    const req = {
      query: { userId }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Appeler la fonction à tester
    await getFavoriteRecipes(req, res);

    // Vérifier les résultats
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(testData);

    // Vérifications supplémentaires sur la structure des données
    const sentData = res.send.mock.calls[0][0];
    expect(sentData).toHaveProperty('recipes');
    expect(Array.isArray(sentData.recipes)).toBe(true);
    expect(sentData.recipes.length).toBe(1);

    // Vérifier la structure de la recette
    const recipe = sentData.recipes[0];
    expect(recipe).toHaveProperty('instructions');
    expect(recipe).toHaveProperty('servings');
    expect(recipe).toHaveProperty('ingredients');
    expect(recipe).toHaveProperty('title');
    expect(recipe).toHaveProperty('recipeId');
    expect(recipe).toHaveProperty('cookingTime');

    // Vérifier les valeurs spécifiques
    expect(recipe.instructions).toBe("Test instructions");
    expect(recipe.servings).toBe(2);
    expect(recipe.ingredients).toEqual(["Ingredient 1", "Ingredient 2"]);
    expect(recipe.title).toBe("Test Recipe");
    expect(recipe.recipeId).toBe("testRecipeId");
    expect(recipe.cookingTime).toBe(30);
  },10000);

  it('should return 400 if userId is missing', async () => {
    const req = { query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await getFavoriteRecipes(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing userId');
  });

  it('should return 404 if no favorite recipes found', async () => {
    const userId = 'nonexistentUser';
    const req = { query: { userId } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    await getFavoriteRecipes(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No favorite recipes found');
  });
});