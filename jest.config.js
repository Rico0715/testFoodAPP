module.exports = {
    // Spécifie l'environnement de test
    testEnvironment: 'node',
  
    // Chemin vers les fichiers de test
    testMatch: [
      '**/__tests__/**/*.js', // Cherche tous les fichiers de test dans le dossier __tests__
      '**/?(*.)+(spec|test).js' // Cherche tous les fichiers finissant par .spec.js ou .test.js
    ],
  
    // Dossiers racine des tests
    roots: [
      '<rootDir>/test' // Dossier où se trouvent vos tests
    ],
  
    // Modules Jest à ignorer
    // Par exemple, pour ne pas inclure les modules dans node_modules
    // que vous ne souhaitez pas tester
    modulePathIgnorePatterns: [
      '<rootDir>/node_modules'
    ],
  
    // Transformer les fichiers JavaScript avec Babel
    // Si vous utilisez Babel pour transpiler votre code
    transform: {
      '^.+\\.js$': 'babel-jest'
    }
  };
  