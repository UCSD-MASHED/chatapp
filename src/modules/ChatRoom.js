import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      user: props.location.state.user,
      roomName: "test_room",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
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
    let username = this.state.user.username;
    let roomName = this.state.roomName;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
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
      .add({
        message: message,
        timestamp: timestamp,
        userId: username,
      });
  }

  render() {
    return (
      <>
        <main>
          {/* {messages &&
                        messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)} */}
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
