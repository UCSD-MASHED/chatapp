import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";
import Jokes from "./Jokes";

/**
 * This is the Login Component used to render the log in page and handle user
 * actions such as log in with Google account.
 */
class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      imgState: 0,
    };
    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
    this.incrementImgState = this.incrementImgState.bind(this);
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

    this.timer = setInterval(this.incrementImgState, 6000);
  }

  componentWillUnmount() {
    this.unsubscribeAuthListener();
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Handles Sign in button click, opens a pop up to Google sign in page
   * Once sign in is completed, we will get back the Google user object.
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
  } /* handleGoogleSignIn */

  /**
   * Get the user from googleUser
   * @param {_GoogleUser} googleUser - Google user to be found in database
   * @return {_User|undefined} [user]{@link _User} if googleUser.uid is
   *     unique in database; otherwise undefined
   */
  async getUser(googleUser) {
    var res = await firebase
      .firestore()
      .collection("users")
      .doc(googleUser.uid)
      .get()
      .then((doc) => doc.data());
    return res;
  } /* getUser */

  /**
   * Loops through all {@link Jokes} images
   */
  incrementImgState() {
    this.setState({
      imgState: this.state.imgState < 4 ? this.state.imgState + 1 : 0,
    });
  } /* incrementImgState */

  /**
   * Log in the Google user and redirect to the chat room page if the user exists,
   * otherwise, redirect to the user creation page
   * @param {_GoogleUser} googleUser - Google user to be logged in and redirected
   */
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
  } /* loginWithGoogleUserAndRedirect */

  render() {
    return this.state.loading ? (
      <Loading />
    ) : (
      <div className="auth-wrapper">
        <div className="signin-wrapper">
          <span className="landing-left-wrapper">
            <div className="landing-text">
              <h1>TaterTalk</h1>
              <br></br>
              <p>Presented by Team Mashed</p>
              <br></br>
              <button
                style={{ width: "20vw", height: "8vh", fontSize: "3vh" }}
                onClick={this.handleGoogleSignIn}
                className="btn btn-primary btn-sm"
              >
                Sign In
              </button>
            </div>
          </span>
          <span className="landing-right-wrapper">
            <img
              className="landing-img"
              alt="illustration"
              src={process.env.PUBLIC_URL + "/landing_illustration.png"}
            />
          </span>
          <Jokes imgState={this.state.imgState} />
        </div>
        <ToastContainer />
      </div>
    );
  }
}

export default withRouter(Login);
