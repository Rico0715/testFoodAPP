import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import RecipeScreen from './screens/RecipeScreen';
import SaisieIngredientScreen from './screens/SaisieIngredientScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';
import { auth, onAuthStateChanged } from './firebase';
import FavoriteRecipes from './screens/FavoriteRecipes';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Scan', headerShown: false }} />
      <Stack.Screen name="Recipe" component={RecipeScreen} options={{ title: 'Recette' }} />
    </Stack.Navigator>
  );
}

function SaisieIngredientStack() {
  return (
    <Stack.Navigator initialRouteName="SaisieIngredient">
      <Stack.Screen name="SaisieIngredient" component={SaisieIngredientScreen} options={{ title: 'Saisie', headerShown: false }} />
      <Stack.Screen name="Recipe" component={RecipeScreen} options={{ title: 'Recette' }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="FavoriteRecipes" component={FavoriteRecipes} options={{ title: 'Mes Recettes' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Scan" component={HomeStack} options={{ tabBarLabel: 'Scan' }} />
        <Tab.Screen name="Saisie" component={SaisieIngredientStack} options={{ tabBarLabel: 'Saisie' }} />
        {user ? (
          <Tab.Screen 
            name="Profile" 
            component={ProfileStack} 
            options={{ tabBarLabel: 'Profile' }}
          />
        ) : (
          <Tab.Screen name="Profile" component={AuthStack} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
