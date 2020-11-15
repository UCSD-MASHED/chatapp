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
