import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Loading from "./Loading";
import Landing from "./Landing";

/**
 * This is the Login Component
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

  incrementImgState() {
    this.setState({
      imgState: this.state.imgState < 4 ? this.state.imgState + 1 : 0,
    });
  }

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
            <Landing imgState={this.state.imgState} />
          </span>
        </div>
        <ToastContainer />
      </div>
    );
  }
}

export default withRouter(Login);
