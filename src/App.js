import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Login from "./modules/Login.js";
import CreateUser from "./modules/CreateUser.js";
// import Chat from './modules/Chat.js'
import "bootstrap/dist/css/bootstrap.min.css";

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
    appId: "1:1056001987312:web:c0e59a9e51560b70126835",
  };
} else {
  firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
  };
}

firebase.initializeApp(firebaseConfig);

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/createUser" component={CreateUser} />
        {/* <Route exact path='/chat' component={Chat} /> */}
        <Route path="/sign-in" component={Login} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
