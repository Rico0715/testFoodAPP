import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, Button } from 'react-native';
import { Image } from 'react-native-elements';
import { firestore } from '../firebase'; // Assurez-vous d'importer correctement firestore
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
export default function FavoriteRecipesScreen({ navigation }) {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(firestore, 'favoriteRecipes', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFavoriteRecipes(data.recipes || []);
          } else {
            console.log('No favorite recipes found for this user.');
          }
        }
      } catch (error) {
        console.error('Error fetching favorite recipes:', error);
      }
    };

    fetchFavoriteRecipes();
  }, []);

  const navigateToRecipeDetails = (recipeId) => {
    navigation.navigate('Recipe', { recipeId });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {favoriteRecipes.length > 0 ? (
          favoriteRecipes.map((recipe, index) => (
            <View key={index} style={styles.recipeItem}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              {recipe.image ? (
                <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              ) : (
                <Text style={styles.text}>Aucune image disponible</Text>
              )}
              <Button title="Voir recette" onPress={() => navigateToRecipeDetails(recipe.recipeId)} />
            </View>
          ))
        ) : (
          <Text style={styles.text}>Aucune recette favorite trouvée.</Text>
        )}
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
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  recipeItem: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});
