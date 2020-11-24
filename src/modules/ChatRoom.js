import React, { createRef } from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import User from "./User";
import "../App.css";

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);

    let user = null;
    if (props.location && props.location.state && props.location.state.user) {
      user = props.location.state.user;
    }

    this.state = {
      message: "",
      roomName: "test_room",
      messages: [],
      user: user,
      users: [],
    };
    this.dummy = createRef();
    this.initMessages = false;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (!this.state.user) {
      this.props.history.replace("/");
    } else {
      if (!this.initMessages) {
        this.getInitMessages().then(() => {
          this.scrollToBottom();
        });
        this.initMessages = true;
      }
      this.getMessages().then(() => {
        this.scrollToBottom();
      });
      this.getUsers(this.state.user.username).then((users) => {
        this.setState({ users: users });
      });
    }
  }

  componentWillUnmount() {
    // this.dbListener();
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ message: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.checkUserInRoom()) {
      this.sendMessage();
      this.scrollToBottom();
    }
  }

  async getUsers(userName) {
    /*
     * Get all the users excluding the current user
     * @param {string} userName - The username of the current user
     * @return {user[]} An array of user objects
     */
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "!=", userName)
      .get()
      .then((docs) => {
        let users = [];
        docs.forEach((doc) => {
          users.push(doc.data());
        });
        return users;
      });
    return res;
  }

  async checkUserInRoom() {
    /*
     * Query by roomName and userName to check if the
     * user is in this chatroom.
     */
    let username = this.state.user.username;
    let roomName = this.state.roomName;

    var res = await firebase
      .firestore()
      .collection("rooms")
      .where("roomName", "==", roomName)
      .where("participants", "array-contains", username)
      .get()
      .then((qs) => {
        return !qs.empty;
      });
    return res;
  }

  async sendMessage() {
    /*
     * Update user timestamp and append message to room of messages.
     */
    let message = this.state.message;
    let username = this.state.user.username;
    let roomName = this.state.roomName;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let newMessage = {
      message: message,
      timestamp: timestamp,
      username: username,
    };
    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomName)
      .set({ username: timestamp });

    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomName)
      .collection("messages")
      .add(newMessage);

    this.setState({ message: "" }); // set message bar text back to placeholder (empty)
  }

  async getInitMessages() {
    console.log("inside get init messages");
    // console.log(this.state.user.username);
    /*
     * Get messages based off of roomName
     */
    let roomName = this.state.roomName;
    let msgs = [];
    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomName)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .get()
      .then((snapshot) => {
        snapshot.forEach(function (doc) {
          msgs.push(doc.data());
        });
      });
    // console.log(msgs);
    this.setState({ messages: msgs });
  }

  async getMessages() {
    /*
     * Listener to messages list. Periodically update messages.
     */
    let roomName = this.state.roomName;
    this.dbListener = firebase
      .firestore()
      .collection("rooms")
      .doc(roomName)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        this.state.messages = [];
        snapshot.forEach((doc) => {
          this.state.messages.push(doc.data());
          this.scrollToBottom();
        });
      });
  }

  scrollToBottom() {
    if (this.dummy.current) {
      this.dummy.current.scrollIntoView();
    }
  }

  render() {
    console.log(this.state.users);
    return (
      <div className="main">
        <div className="user-list-wrapper">
          <h3>People</h3>
          <div className="list-group">
            {this.state.users &&
              this.state.users.map((user, i) => <User key={i} user={user} />)}
          </div>
        </div>
        <div className="chat-wrapper">
          <h3>Chat Room</h3>
          <div className="chat-messages">
            {this.state.messages &&
              this.state.messages
                .reverse()
                .map((msg, i) => (
                  <ChatMessage
                    key={i}
                    message={msg}
                    username={this.state.user.username}
                  />
                ))}
            <span ref={this.dummy}></span>
          </div>
          <div className="chat-input">
            <form onSubmit={this.handleSubmit}>
              {/* {this.state.showEmoji ? (
                  <EmojiPicker onClickOutside={() => this.toggleEmojiPicker()} title={'Pick your emoji'} emoji={'point_up'} data={data} style={{ position: "absolute", bottom: "100px", right: "0" }} set="apple" onSelect={this.addEmoji} />
              ) : null} */}

              <div className="input-group chat-box">
                <input
                  className="form-control"
                  type="text"
                  value={this.state.message}
                  onChange={this.handleChange}
                  placeholder="Potatoes can't talk... but you can!"
                />
                {/* <div className="input-group-append">
                      <button type="button" className="btn" onClick={() => this.toggleEmojiPicker()} id="show-emoji-yes">{'😃'}</button>
                  </div> */}
              </div>

              <button
                disabled={!this.state.message}
                type="submit"
                className="btn btn-primary btn-block"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ChatRoom);