import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
  }

  handleGoogleSignIn(event) {
    /*
     * Handles Sign in button click, opens a pop up to google sign in page
     * Once sign in is completed, we will get back the google user object.
     * We will use the uid to distinguish each user.
     * If the user is new, we will take them to CreateUser to ask them fill
     * in a username (has to be unique),
     * else we will take them to Chat.
     */
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
        // console.log(googleUser);
        this.getUser(googleUser)
          .then((user) => {
            // console.log(user);
            if (user) {
              // TODO: go to chat
              console.log("user exists, go to chat");
            } else {
              console.log("user does not exists, go to create user");
              this.props.history.push("/createUser", { googleUser });
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async getUser(googleUser) {
    /*
     * Try to find the user in firestore from googleUser
     * If the user exists, we return the user object,
     * else we will return undefined, which means googleUser
     * is a new user.
     */
    var res = await firebase
      .firestore()
      .collection("users")
      .doc(googleUser.uid)
      .get()
      .then((doc) => doc.data());
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
        <ToastContainer />
      </div>
    );
  }
}

export default withRouter(Login);
