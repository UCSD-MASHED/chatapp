import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import 'bootstrap/dist/css/bootstrap.min.css';
// import firebase config
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

let firebaseConfig;

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  // we use beta app config
  firebaseConfig = {
    apiKey: "AIzaSyClt_cw75ffjm45ehfsrcnpCSRm17p0Xyg",
    authDomain: "twotenchatapp-beta-a41e8.firebaseapp.com",
    databaseURL: "https://twotenchatapp-beta-a41e8.firebaseio.com",
    projectId: "twotenchatapp-beta-a41e8",
    storageBucket: "twotenchatapp-beta-a41e8.appspot.com",
    messagingSenderId: "1056001987312",
    appId: "1:1056001987312:web:c0e59a9e51560b70126835"
  };
} else {
  firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID
  };
}


firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
