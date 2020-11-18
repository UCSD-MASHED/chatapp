import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage.js";
import "../App.css" // needs to change

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      roomName: "test_room",
      messages: [],
      user: props.location.state.user,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount = () => {
    let roomName = this.state.roomName;
    const messagesRef = firebase.firestore().collection("rooms").doc(roomName).collection("messages");
    const query = messagesRef.orderBy("timestamp", "desc").limit(5); 
    query.get().then(querySnapshot => {
      const msgs = [];

      querySnapshot.forEach(function(doc) {
        msgs.push({
          message: doc.data().message,
          timestamp: doc.data().timestamp,
          userId: doc.data().username
        });
      });

      this.setState({ messages: msgs });
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
 }

  handleChange(event) {
    event.preventDefault();
    this.setState({ message: event.target.value });
    //console.log(this.state.messages)
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.checkUserInRoom()) {
      this.sendMessage();
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
     *
     */
    let message = this.state.message;
    //let messages = this.state.messages;
    let username = this.state.user.username;
    let roomName = this.state.roomName;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let newMessage = {
      message: message,
      timestamp: timestamp,
      userId: username
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
      this.setState({ message: '' }); // set message bar text back to placeholder (empty)

    // pretty hacky way to update most recent messages
    var newMessages = this.state.messages;
    newMessages.unshift(newMessage);
    newMessages = newMessages.slice(0, -1);
    this.setState({messages: newMessages})
    console.log(this.state.messages)
  }
  render() {
    return (
      <>
        <main>
          {this.state.messages && this.state.messages.length > 0 && this.state.messages.reverse().map((msg, i) =>
            <ChatMessage key={i} message={msg} />
          )}
        </main>

        <form onSubmit={this.handleSubmit}>
          <input
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Potatoes can't talk... but you can!"
          />

          <button type="submit" disabled={!this.state.message}>
            🕊️
          </button>
        </form>
      </>
    );
  }
}

export default withRouter(ChatRoom);
