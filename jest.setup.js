const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

// Initialiser Firebase Admin SDK avec des informations d'identification de test
const serviceAccount = require('../testFoodAPP/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

const setupFirestore = async () => {
  // Configuration initiale pour votre Firestore de test
  return firestore;
};

const teardownFirestore = async () => {
    // Supprimer uniquement les données de test spécifiques
    const collections = await firestore.listCollections();
    const deletePromises = collections.map(async (collection) => {
      if (collection.id.startsWith('test_')) { // Supprimer uniquement les collections de test
        const documents = await collection.listDocuments();
        return Promise.all(documents.map((doc) => doc.delete()));
      }
      return null;
    });
    await Promise.all(deletePromises);
  };
  

module.exports = { setupFirestore, teardownFirestore };
