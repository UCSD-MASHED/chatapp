import React from "react";
import firebase from "firebase/app";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
  }

  handleGoogleSignIn(event) {
    event.preventDefault();
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(googleProvider)
      .then((res) => {
        var googleUser = {
          uid: res.user.uid,
          displayName: res.user.displayName,
        };
        // console.log(googleUser)
        this.userExists(googleUser).then((exists) => {
          if (exists) {
            // TODO: go to chat
            console.log("user exists, go to chat");
          } else {
            console.log("user does not exists, go to create user");
            this.props.history.push("/createUser", { googleUser });
          }
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  async userExists(user) {
    var res = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        return doc.exists;
      })
      .catch((error) => {
        console.log("An error occurs");
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
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
