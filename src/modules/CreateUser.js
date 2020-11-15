import React from "react";
import firebase from "firebase/app";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class CreateUser extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isSignedIn: !(
        props.location.state == null || props.location.state.googleUser == null
      ),
      username: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ username: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    var isUnique = await this.usernameIsUnique(
      this.state.username
    ).catch((err) => console.log(err));
    if (isUnique) {
      var user = await this.createUser(
        this.props.location.state.googleUser,
        this.state.username
      ).catch((error) => console.log(error));
      if (user) {
        // TODO: successful, go to chat
        console.log("Go to chat");
        toast.success("User is created successfully.");
      } else {
        // error
        toast.error("Cannot create user.");
      }
    } else {
      toast.error("Username is not unique.");
      // warning popup, create another username
    }
  }

  componentDidMount() {
    // go back to sign-in page if not signed in
    if (!this.state.isSignedIn) {
      this.props.history.replace("/");
    }
  }

  async usernameIsUnique() {
    var username = this.state.username;
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        return querySnapshot.empty;
      });
    return res;
  }

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

export default CreateUser;
