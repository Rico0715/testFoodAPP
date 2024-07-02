const functionsTest = require('firebase-functions-test')({
    databaseURL: 'https://my-project.firebaseio.com',
    storageBucket: 'foodapp-426008.appspot.com',
    projectId: 'foodapp-426008',
  }, '../serviceAccountKey.json');
  
  const chai = require('chai');
  const request = require('supertest');
  const myFunctions = require('../functions/index'); // Assurez-vous que le chemin est correct
  const admin = require('firebase-admin');
  
  // Initialize test environment
  const testEnv = functionsTest();
  
  describe('Firebase Functions API Tests', () => {
    let app;
  
    before(() => {
      app = require('firebase-functions-test').wrap(myFunctions);
      admin.initializeApp();
    });
  
    after(() => {
      functionsTest.cleanup();
    });
  
    describe('getFavoriteRecipes', () => {
      it('should return 400 if userId is missing', async () => {
        await request(app)
          .get('/getFavoriteRecipes')
          .expect(400)
          .then(response => {
            chai.expect(response.text).to.equal('Missing userId');
          });
      });
  
      it('should return 404 if no favorite recipes found', async () => {
        const userId = 'nonexistentUser';
        await request(app)
          .get(`/getFavoriteRecipes?userId=${userId}`)
          .expect(404)
          .then(response => {
            chai.expect(response.text).to.equal('No favorite recipes found');
          });
      });
  
      // Ajoutez plus de tests pour d'autres scénarios...
    });
  
    describe('addFavoriteRecipe', () => {
      it('should return 400 if userId or recipe is missing', async () => {
        await request(app)
          .post('/addFavoriteRecipe')
          .send({})
          .expect(400)
          .then(response => {
            chai.expect(response.text).to.equal('Missing userId or recipe');
          });
      });
  
      it('should add a favorite recipe successfully', async () => {
        const userId = 'testUser';
        const recipe = {
          recipeId: 123,
          title: 'Test Recipe',
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          instructions: 'Test instructions'
        };
  
        await request(app)
          .post('/addFavoriteRecipe')
          .send({ userId, recipe })
          .expect(200)
          .then(response => {
            chai.expect(response.text).to.equal('Recipe added to favorites');
          });
  
        // Vérifiez que la recette a été ajoutée dans Firestore...
        const doc = await admin.firestore().collection('favoriteRecipes').doc(userId).get();
        chai.expect(doc.exists).to.be.true;
        chai.expect(doc.data().recipes).to.deep.include(recipe);
      });
  
      // Ajoutez plus de tests pour d'autres scénarios...
    });
  
    // Ajoutez des tests similaires pour updateFavoriteRecipe et deleteFavoriteRecipe...
  });
  