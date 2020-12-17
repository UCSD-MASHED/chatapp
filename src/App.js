import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Login from "./modules/Login.js";
import CreateUser from "./modules/CreateUser.js";
import ChatRoom from "./modules/ChatRoom.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./firebase.js";
import "./App.css";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/createUser" component={CreateUser} />
        <Route exact path="/chatRoom" component={ChatRoom} />
        <Route path="/sign-in" component={Login} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
