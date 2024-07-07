import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

export default function ProfileScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [favoriteRecipe, setFavoriteRecipe] = useState(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || '');
      }
    };

    const fetchFavoriteRecipe = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('favoriteRecipe');
        if (jsonValue !== null) {
          const recipe = JSON.parse(jsonValue);
          setFavoriteRecipe(recipe);
        }
      } catch (error) {
        console.error('Error fetching favorite recipe:', error);
      }
    };

    fetchEmail();
    fetchFavoriteRecipe();
  }, []);

  const navigateToFavoriteRecipes = () => {
    navigation.navigate('FavoriteRecipes');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Déconnexion de l'utilisateur
      navigation.navigate('Login'); // Redirection vers l'écran de connexion
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.text}>{email}</Text>
      <TouchableOpacity style={styles.button} onPress={navigateToFavoriteRecipes}>
        <Text style={styles.buttonText}>Mes Recettes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
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
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});
