import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions, Image } from 'react-native';
import { Button, Card } from 'react-native-elements';
import { BarCodeScanner } from 'expo-barcode-scanner';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;

function HomeScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
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
        <View style={styles.scannerContainer}>
          <Image source={require('../assets/LogoNewChef.png')} style={styles.logo} />
          <View style={styles.barcodeScannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.barcodeScanner}
            />
          </View>
          <View style={styles.scanBox}>
            <Text style={styles.scanText}>Place the barcode within the frame to scan</Text>
          </View>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {productData ? (
            <Card containerStyle={styles.productCard}>
              <Card.Title>{productData.product_name}</Card.Title>
              <Card.Divider />
              <Text style={styles.text}>Product Name : {productData.generic_name_en}</Text>
              <Text style={styles.text}>Brand : {productData.brands}</Text>
              {productData.nutrition_grades ? (
                <Text style={styles.text}>Nutri-Score : {productData.nutrition_grades.toUpperCase()}</Text>
              ) : (
                <Text style={styles.text}>Nutri-Score : N/A</Text>
              )}
              <Button title="Scan Again" onPress={() => setScanned(false)} />
            </Card>
          ) : (
            <Text style={styles.text}>Loading product data...</Text>
          )}
          <Text style={styles.text}>My recipes :</Text>
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
    backgroundColor: '#f2f5f6',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative', // Ajout d'une position relative au conteneur principal
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
    marginTop: 50, // Augmentation de la marge supérieure pour placer le logo plus haut
    position: 'absolute', // Position absolue pour le logo
    top: 0, // Alignement en haut du conteneur principal
  },
  barcodeScannerContainer: {
    width: 300,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeScanner: {
    width: '100%', // Utilisation de '100%' pour occuper toute la largeur du parent
    height: '100%',
  },
  scanBox: {
    position: 'absolute',
    width: 300,
    height: 100,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%', // Centrage vertical du scanBox
    marginTop: -50, // Ajustement négatif de la moitié de la hauteur pour centrer exactement
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
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
    backgroundColor: 'white',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  recipeList: {
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '100%',
    marginTop: 50,
  },
  productCard: {
    width: '98%',
    alignSelf: 'center',
    padding: 20,
  },
});

export default HomeScreen;
