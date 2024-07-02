// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb+srv://aymericnicolle95:Vw56AYjNRplx3nMh@clusterfoodapp.sgorbuo.mongodb.net/foodapp?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// Vérification de la connexion à MongoDB
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

// Définition du modèle de recette
const recipeSchema = new mongoose.Schema({
  title: String,
  image: String,
  ingredients: [String],
  cookingTime: Number,
  preparationTime: Number,
  servings: Number,
  diets: [String],
  instructions: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Routes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  const recipe = new Recipe({
    title: req.body.title,
    image: req.body.image,
    ingredients: req.body.ingredients,
    cookingTime: req.body.cookingTime,
    preparationTime: req.body.preparationTime,
    servings: req.body.servings,
    diets: req.body.diets,
    instructions: req.body.instructions
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
