import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

/**
 * This is the Login Component
 */
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
  }

  /**
   * Handles Sign in button click, opens a pop up to google sign in page
   * Once sign in is completed, we will get back the google user object.
   * We will use the uid to distinguish each user. If the user is new,
   * we will take them to CreateUser to ask them fill in a unique username,
   * else we will take them to Chat.
   * @param {Object} event - An Event Object
   */
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
        // console.log(googleUser);
        this.getUser(googleUser)
          .then((user) => {
            // console.log(user);
            if (user) {
              // TODO: go to chat
              console.log("user exists, go to chat");
              this.props.history.push("/chatRoom", { user });
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

  /**
   * Get the user from googleUser
   * @param {Object} googleUser - The google user to be found in database
   * @param {string} googleUser.uid - The unique id of the google user
   * @param {string} googleUser.displayName - The displayed name of the
   *     google user
   * @return {(user|undefined)} A user object if googleUser.uid is unique
   *     in database; otherwise return undefined
   */
  async getUser(googleUser) {
    var res = await firebase
      .firestore()
      .collection("users")
      .doc(googleUser.uid)
      .get()
      .then((doc) => doc.data());
    return res;
  }

  render() {
    //if (this.state.toChatRoom) {
    //  return <Redirect to='/chatRoom' />
    //}
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
