import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';

function SaisieIngredientScreen({ navigation }) {
  const [ingredientQuery, setIngredientQuery] = useState('');
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = async () => {
    try {
      const apiKey = '24bbb27e6a9a4dc593c5eaee559a16b4';
      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${ingredientQuery}`);
      const data = await response.json();
      setRecipes(data.results);
    } catch (error) {
      console.error('Error fetching recipe data:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => navigation.navigate('Recipe', { recipeId: item.id })}
    >
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Text style={styles.recipeSummary}>{item.summary}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rechercher des recettes par ingrédient..."
        onChangeText={text => setIngredientQuery(text)}
        value={ingredientQuery}
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={fetchRecipes}
      >
        <Text style={styles.searchButtonText}>Rechercher</Text>
      </TouchableOpacity>
      <FlatList
        data={recipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  searchButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  recipeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    marginBottom: 10,
  },
  recipeTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  recipeSummary: {
    fontSize: 16,
  },
});

export default SaisieIngredientScreen;
