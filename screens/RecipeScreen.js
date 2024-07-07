import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, Button, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'react-native-elements';
import { firestore, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function RecipeScreen({ route }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const apiKey = '24bbb27e6a9a4dc593c5eaee559a16b4';
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const data = await response.json();
        setRecipe(data);
        console.log('Recipe image URL test:', data.image); // Vérifiez que l'URL est correctement récupérée
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipeId]);

  const saveToFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (user && recipe) {
        const recipeData = {
          recipeId: recipe.id,
          title: recipe.title,
          ingredients: recipe.extendedIngredients.map(ing => ing.original),
          cookingTime: recipe.readyInMinutes,
          preparationTime: recipe.preparationMinutes || 'Non spécifié',
          servings: recipe.servings,
          diets: recipe.diets.length > 0 ? recipe.diets : ['Non spécifié'],
          instructions: recipe.instructions
        };

        const docRef = doc(firestore, 'favoriteRecipes', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          await updateDoc(docRef, {
            recipes: arrayUnion(recipeData)
          });
        } else {
          await setDoc(docRef, {
            recipes: [recipeData]
          });
        }
        alert('Recipe saved to favorites!');
      } else {
        alert('User not authenticated or recipe data missing.');
      }
    } catch (error) {
      console.error('Error saving recipe to favorites:', error);
    }
  };

  const openSourceUrl = () => {
    if (recipe && recipe.sourceUrl) {
      Linking.openURL(recipe.sourceUrl);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Erreur lors du chargement des détails de la recette.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.recipeDetailsContainer}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          {recipe.image && !imageError ? (
            <Image
              source={{ uri: recipe.image }}
              style={styles.recipeImageLarge}
              onError={handleImageError}
            />
          ) : (
            <Text style={styles.text}>Aucune image disponible</Text>
          )}
          <Text style={styles.text}>Ingrédients:</Text>
          <View style={styles.ingredientsContainer}>
            {recipe.extendedIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>{ingredient.original}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.text}>Temps de cuisson: {recipe.readyInMinutes} minutes</Text>
          <Text style={styles.text}>Temps de préparation: {recipe.preparationMinutes ? recipe.preparationMinutes : 'Non spécifié'}</Text>
          <Text style={styles.text}>Nombre de portions: {recipe.servings}</Text>
          <Text style={styles.text}>Régimes: {recipe.diets.length > 0 ? recipe.diets.join(', ') : 'Non spécifié'}</Text>
          <Text style={styles.text}>Instructions:</Text>
          <Text style={styles.instructions}>{recipe.instructions}</Text>
          <View style={styles.buttonContainer}>
            {recipe.sourceUrl && (
              <Button title="Source de la recette" onPress={openSourceUrl} />
            )}
            <Button title="Favoris" onPress={saveToFavorites} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  recipeDetailsContainer: {
    width: width - 40,
    padding: 20,
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  recipeImageLarge: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ingredientsContainer: {
    width: '100%',
  },
  ingredientItem: {
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    lineHeight: 24,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 20,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
