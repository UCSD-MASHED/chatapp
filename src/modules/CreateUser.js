import React from "react";
import firebase from "firebase/app";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { withRouter } from "react-router-dom";

class CreateUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      /*
       * If the user 'hacked' into this page by typing the URL,
       * it will not have any history and props.location will be empty.
       * We need this boolean to detect and return user to sign in page accordingly.
       */
      isSignedIn: !(
        props.location == null ||
        props.location.state == null ||
        props.location.state.googleUser == null
      ),
      username: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    /*
     * Handles username input change, update state accordingly.
     */
    this.setState({ username: event.target.value });
  }

  handleSubmit(event) {
    /*
     * Handles Submit button click, it will first check if the username
     * is unique, if it is, it will then create the user in firestore with
     * the username and display a toast and redirect to Chat,
     * else it will display an error toast and remain in the page.
     */
    event.preventDefault();
    this.usernameIsUnique(this.state.username)
      .then((isUnique) => {
        if (isUnique) {
          this.createUser(
            this.props.location.state.googleUser,
            this.state.username
          )
            .then((user) => {
              if (user) {
                // TODO: successful, go to chat
                console.log("Go to chat");
                toast.success("User is created successfully.");
              } else {
                // error
                toast.error("Cannot create user.");
              }
            })
            .catch((error) => console.log(error));
        } else {
          toast.error("Username is not unique.");
          // warning popup, create another username
        }
      })
      .catch((err) => console.log(err));
  }

  componentDidMount() {
    /*
     * Go back to sign-in page if not signed in
     * (This can happen when the user types in the URL (/createUser) directly)
     */
    if (!this.state.isSignedIn) {
      this.props.history.replace("/");
    }
  }

  async usernameIsUnique() {
    /*
     * Check if current state.username is unique in firestore.
     * If it is, return true, else return false.
     */
    var username = this.state.username;
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get()
      .then((querySnapshot) => querySnapshot.empty);
    return res;
  }

  async createUser(googleUser, username) {
    /*
     * Create the actual user in firebase given the googleUser
     * and the unique username.
     * Returns the user object once creation is complete.
     */
    var user = {
      username: username,
      displayName: googleUser.displayName,
      // blockIds: [],
      // friendIds: [],
      online: false,
      roomIds: [],
    };
    var res = await firebase
      .firestore()
      .collection("users")
      .doc(googleUser.uid)
      .set(user)
      .then(() => {
        console.log("Create user successfully");
        return user;
      })
      .catch((err) => {
        console.log("An error occurs", err);
        return {};
      });
    return res;
  }

  render() {
    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form>
            <h4>Please enter your username</h4>
            <div className="form-group">
              <input
                type="username"
                className="form-control"
                placeholder="Enter your username"
                value={this.state.name}
                onChange={this.handleChange}
              />
              <br />
              <button
                onClick={this.handleSubmit}
                className="btn btn-primary btn-block"
              >
                Submit
              </button>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    );
  }
}

export default withRouter(CreateUser);
