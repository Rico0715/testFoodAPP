import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { Button, Card, Image } from 'react-native-elements';
import { BarCodeScanner } from 'expo-barcode-scanner';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;

function HomeScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState('back');
  const [productData, setProductData] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    await fetchProductData(data);
  };

  const fetchProductData = async (barcode) => {
    try {
      console.log(`Fetching product data for barcode: ${barcode}`);
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      const product = data.product;
      console.log('Product data fetched:', product);
      setProductData(product);
      if (product && product.generic_name_en) {
        await fetchRecipeData(product.generic_name_en);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const fetchRecipeData = async (genericName) => {
    try {
      console.log(`Fetching recipe data for product: ${genericName}`);
      const encodedGenericName = encodeURIComponent(genericName);
      const apiKey = '24bbb27e6a9a4dc593c5eaee559a16b4';
      const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${encodedGenericName}&maxFat=25`);
      const data = await response.json();
      console.log('Recipe data fetched:', data);
      if (data && data.results && data.results.length > 0) {
        setRecipes(data.results);
      } else {
        console.log('No recipe found for the product:', genericName);
      }
    } catch (error) {
      console.error('Error fetching recipe data:', error);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={() => BarCodeScanner.requestPermissionsAsync()} title="Grant Permission" />
      </View>
    );
  }

  const renderRecipe = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Recipe', { recipeId: item.id })}>
      <Card containerStyle={styles.card}>
        <Card.Title>{item.title}</Card.Title>
        <Card.Divider />
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!scanned ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        >
          
        </BarCodeScanner>
      ) : (
        <View style={styles.contentContainer}>
          {productData ? (
             <Card containerStyle={styles.productCard}>
             <Card.Title>{productData.product_name}</Card.Title>
             <Card.Divider />
             <Text style={styles.text}>Nom produit : {productData.generic_name_en}</Text>
             <Text style={styles.text}>Marque : {productData.brands}</Text>
             {productData.nutrition_grades ? (
               <Text style={styles.text}>Nutri-Score : {productData.nutrition_grades.toUpperCase()}</Text>
             ) : (
               <Text style={styles.text}>Nutri-Score : N/A</Text>
             )}
             <Button title="Scan Again" onPress={() => setScanned(false)} />
             
           </Card>
          ) : (
            <Text style={styles.text}>Chargement des données du produit...</Text>
            
          )}
          <Text style={styles.text}>Mes recettes :</Text>
          <FlatList

            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.recipeList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
        alignItems: 'center', // Ajout de cette ligne

  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    width: (screenWidth - 80) / numColumns,
    backgroundColor:'white',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  recipeList: {
     justifyContent: 'center', // Centrer verticalement
    alignItems: 'center',
    justifyContent: "space-around",
    width: '100%' ,
    maxWidth: '100%',
    marginTop:50,
    position: 'fixed', /* or absolute, fixed, or sticky */
    zIndex: 10,
  },
  productCard: {
    width: '98%', // Réduire la largeur de cette carte spécifique
    alignSelf: 'center',
    padding: 20,
  },

  
});

export default HomeScreen;