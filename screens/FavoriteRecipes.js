import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { firestore, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function FavoriteRecipes() {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, 'favoriteRecipes', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.recipes && Array.isArray(data.recipes)) {
            setFavoriteRecipes(data.recipes);
          } else {
            setFavoriteRecipes([]);
          }
        } else {
          setFavoriteRecipes([]);
        }
      }
    };

    fetchFavoriteRecipes();
  }, []);

  const handleRecipePress = (recipe) => {
    console.log(recipe); // Remplacez cette fonction par ce que vous voulez faire lorsque l'utilisateur clique sur un bouton de recette
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Recettes favorites:</Text>
      {favoriteRecipes.length > 0 ? (
        favoriteRecipes.map((recipe, index) => (
          <View key={index} style={styles.favoriteRecipeContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleRecipePress(recipe)}
            >
              <Text style={styles.buttonText}>{recipe.title}</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.text}>Aucune recette favorite enregistrée.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  favoriteRecipeContainer: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});
