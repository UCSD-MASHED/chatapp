import React from 'react';
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";

/**
 * This is the Login Component
 */
class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: true };
    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
  }

  componentDidMount() {
    this.unsubscribeAuthListener = firebase
      .auth()
      .onAuthStateChanged((user) => {
        if (user) {
          var googleUser = {
            uid: user.uid,
            displayName: user.displayName,
          };
          // User is signed in
          this.loginWithGoogleUserAndRedirect(googleUser);
        } else {
          // Not signed in
          this.setState({ loading: false });
        }
      });
  }

  componentWillUnmount() {
    this.unsubscribeAuthListener();
  }

  loginWithGoogleUserAndRedirect(googleUser) {
    this.getUser(googleUser)
      .then((user) => {
        // console.log(user);
        if (user) {
          // console.log("user exists, go to chat");
          this.props.history.push("/chatRoom", { user });
        } else {
          // console.log("user does not exists, go to create user");
          this.props.history.push("/createUser", { googleUser });
        }
      })
      .catch((err) => {
        // console.log(err);
        toast.error(err);
      });
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
        this.loginWithGoogleUserAndRedirect(googleUser);
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
    return this.state.loading ? (
      <Loading />
    ) : (
        <div className="auth-wrapper">
          <div className="btn-wrapper">
            <form>
              <button
                style={{ float: "right" }}
                onClick={this.handleGoogleSignIn}
                className="btn btn-primary btn-sm"
              >
                Sign In
                </button>
            </form>

            <span className="landing-left-wrapper">
              <div className="landing-text">
                <h1>
                  TaterTalk
                  </h1>
                <br></br>
                <p>Presented by Team Mashed</p>
              </div>
            </span>
            <span className="landing-right-wrapper">
              <img className="landing-img" alt="illustration" src={process.env.PUBLIC_URL + '/landing_illustration.png'} />
            </span>
          </div>
          <ToastContainer />
        </div>
      );
  }
}

export default withRouter(Login);
