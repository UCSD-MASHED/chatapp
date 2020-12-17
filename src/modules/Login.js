import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";
import Jokes from "./Jokes";

/**
 * This is the Login Component used to render the login page and handle user
 * actions such as logging in with a Google account.
 * @hideconstructor
 */
class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      imgState: 4,
    };
    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
    this.incrementImgState = this.incrementImgState.bind(this);
  }

  /**
   * After the component is inserted into the DOM tree, this creates an observer
   * for whether or not the current user is currently signed in to our app.
   */
  componentDidMount() {
    this.unsubscribeAuthListener = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        var googleUser = {
          uid: user.uid,
          displayName: user.displayName,
        };
        this.loginWithGoogleUserAndRedirect(googleUser);
      } else {
        // Not signed in
        this.setState({ loading: false });
      }
    });

    // for cycling through potato jokes on login page
    this.timer = setInterval(this.incrementImgState, 6000);
  } /* componentDidMount */

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
        this.loginWithGoogleUserAndRedirect(googleUser);
      })
      .catch((err) => {
        console.log(err);
      });
  } /* handleGoogleSignIn */

  /**
   * Get the user corresponding to a Google user
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
        if (user) {
          // User exists, go to chat room page
          this.props.history.push("/chatRoom", { user });
        } else {
          // User does not exist, go to createUser page
          this.props.history.push("/createUser", { googleUser });
        }
      })
      .catch((err) => {
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
              <div>
                <img
                  className="tatertalk-login d-none d-lg-inline"
                  alt="icon"
                  src={process.env.PUBLIC_URL + "/tatertalk_icon.png"}
                />
                <span>
                  <h1 style={{ display: "inline" }}>TaterTalk</h1>
                  <br></br>
                  <p>Presented by Team Mashed</p>
                </span>
              </div>
              <button
                style={{ padding: "1.5vh 8vw", fontSize: "1.5rem" }}
                onClick={this.handleGoogleSignIn}
                className="btn btn-primary btn-sm"
              >
                Sign In
              </button>
            </div>
          </span>
          <span className="landing-right-wrapper">
            <img
              className="landing-img d-none d-md-block"
              alt="illustration"
              src={process.env.PUBLIC_URL + "/landing_illustration_base.png"}
            />
            <Jokes imgState={this.state.imgState} />
          </span>
        </div>
        <ToastContainer />
      </div>
    );
  }
}

export default withRouter(Login);
