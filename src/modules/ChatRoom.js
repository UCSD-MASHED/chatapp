import React, { createRef } from 'react';
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage.js";
import "../App.css"

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      roomName: "test_room",
      messages: [],
      user: props.location.state.user,
    };
    this.dummy = createRef();
    this.initMessages = false;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (!this.initMessages) {
      this.getInitMessages().then(() => { this.scrollToBottom() });
      this.initMessages = true;
    }
    this.getMessages().then(() => { this.scrollToBottom() });
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
    console.log(this.state.user.username);
    /*
     * Get messages based off of roomName
     */
    let roomName = this.state.roomName;
    let msgs = [];
    await firebase.firestore()
      .collection("rooms")
      .doc(roomName)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .get()
      .then(snapshot => {
        snapshot.forEach(function (doc) {
          msgs.push(doc.data());
        });
      });
    console.log(msgs);
    this.setState({ messages: msgs });
  }

  async getMessages() {
    /*
     * Listener to messages list. Periodically update messages.
     */
    let roomName = this.state.roomName;
    this.dbListener = firebase.firestore()
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
    this.dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  render() {

    let style = {
      backgroundColor: "#F8F8F8",
      borderTop: "1px solid #E7E7E7",
      textAlign: "center",
      padding: "20px",
      position: "fixed",
      left: "0",
      bottom: "0",
      height: "60px",
      width: "100%",
    }

    if (this.state.messages[0]) {
      console.log("inside render: " + this.state.messages[0].message);

    }
    console.log(this.state.messages);
    return (
      <>
        <main>
          {this.state.messages &&
            this.state.messages.reverse()
              .map((msg, i) => <ChatMessage key={i} message={msg} username={this.state.user.username} />)}

          <span ref={this.dummy}></span>
        </main>

        <form onSubmit={this.handleSubmit} style={style}>
          <input
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Potatoes can't talk... but you can!"
          />

          <button type="submit" disabled={!this.state.message}>
            Enter
          </button>
        </form>
      </>
    );
  }
}

export default withRouter(ChatRoom);
