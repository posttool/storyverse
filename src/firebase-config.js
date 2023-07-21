// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB1OdFvO5HNFuJzti2L0Erm_kfTRbm8p1g",
    authDomain: "storyverser.firebaseapp.com",
    projectId: "storyverser",
    storageBucket: "storyverser.appspot.com",
    messagingSenderId: "290988210492",
    appId: "1:290988210492:web:a7815793f854e167c20639",
    measurementId: "G-WVHBMNNKB2"
  };


export function getFirebaseConfig() {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return firebaseConfig;
  }
}
