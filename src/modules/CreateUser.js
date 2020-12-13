import React from "react";
import firebase from "firebase/app";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { withRouter } from "react-router-dom";

/**
 * This is the CreateUser Component
 */
class CreateUser extends React.Component {
  constructor(props) {
    super(props);

    let googleUser = null;
    if (
      props.location &&
      props.location.state &&
      props.location.state.googleUser
    ) {
      googleUser = props.location.state.googleUser;
    }

    this.state = {
      /*
       * If the user 'hacked' into this page by typing the URL,
       * it will not have any history and props.location will be empty.
       * We need this boolean to detect and return user to sign in page accordingly.
       */
      googleUser: googleUser,
      username: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handles username input change, update state accordingly.
   */
  handleChange(event) {
    this.setState({ username: event.target.value });
  }

  /**
   * Handles Submit button click, it will first check if the username
   * is unique, if it is, it will then create the user in firestore with
   * the username and display a toast and redirect to Chat,
   * else it will display an error toast and remain in the page.
   * @param {Object} event - An Event Object
   */
  handleSubmit(event) {
    event.preventDefault();
    if (!/^[a-zA-Z0-9]+$/.test(this.state.username)) {
      toast.error(
        "Username is illegal, please only use alphabetic letters and numbers."
      );
      return;
    }
    if (this.state.username.length > 20) {
      toast.error("Username is too long, we only allow up to 20 characters.");
      return;
    }
    this.usernameIsUnique(this.state.username)
      .then((isUnique) => {
        if (isUnique) {
          this.createUser(this.state.googleUser, this.state.username)
            .then((user) => {
              if (user) {
                // console.log("Go to chat");
                toast.success("User is created successfully.");
                this.props.history.push("/chatRoom", { user });
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

  /**
   * Go back to sign-in page if not signed in
   * (This can happen when the user types in the URL (/createUser) directly)
   */
  componentDidMount() {
    if (!this.state.googleUser) {
      this.props.history.replace("/");
    }
  }

  /**
   * Check if the current username is unique in database
   * @param {string} username - The username to be checked in database
   * @return {boolean} True if username is unique; otherwise False
   */
  async usernameIsUnique(username) {
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get()
      .then((querySnapshot) => querySnapshot.empty);
    return res;
  }

  /**
   * Create a user in database
   * @param {Object} googleUser - The google user to be found in database
   * @param {string} googleUser.uid - The unique id of the google user
   * @param {string} googleUser.displayName - The displayed name of the
   *     google user
   * @param {string} username - The username of the user
   * @return {user|null} The newly created user if created successfully;
   *     otherwise null
   */
  async createUser(googleUser, username) {
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
        // console.log("Create user successfully");
        return user;
      })
      .catch((err) => {
        console.log("An error occurs", err);
        return null;
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
