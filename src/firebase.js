// Set up firebase
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

let firebaseConfig;

console.log(process.env.NODE_ENV);
console.log(process.env.REACT_APP_FIREBASE_CONFIG);
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  // we use beta app config
  firebaseConfig = {
    apiKey: process.env.REACT_APP_APIKEY_BETA,
    authDomain: process.env.REACT_APP_AUTHDOMAIN_BETA,
    databaseURL: process.env.REACT_APP_DATABASEURL_BETA,
    projectId: process.env.REACT_APP_PROJECTID_BETA,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET_BETA,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID_BETA,
    appId: process.env.REACT_APP_APPID_BETA,
  };
} else {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
  };
}

firebase.initializeApp(firebaseConfig);
