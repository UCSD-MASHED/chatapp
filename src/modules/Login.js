import React from "react";
import firebase from "firebase/app";
// import "firebase/firestore";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
  }

  async handleGoogleSignIn(event) {
    event.preventDefault();
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    var res = await firebase.auth().signInWithPopup(googleProvider).catch(err => console.log(err));
    var googleUser = {
      uid: res.user.uid,
      displayName: res.user.displayName,
    };
    // console.log(googleUser);
    var user = await this.getUser(googleUser).catch(err => console.log(err));
    // console.log(user);
    if (user) {
      // TODO: go to chat
      console.log("user exists, go to chat");
    } else {
      console.log("user does not exists, go to create user");
      this.props.history.push("/createUser", { googleUser });
    }
    return;
  }

  async getUser(user) {
    var res = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => doc.data())
      .catch((error) => {
        console.log("An error occurs", error.message);
      });
    return res;
  }

  render() {
    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form>
            <h3>Sign In With Google</h3>
            <button
              onClick={this.handleGoogleSignIn}
              className="btn btn-primary btn-block"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
