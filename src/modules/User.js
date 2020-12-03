import React from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase/app";

class User extends React.Component {
  constructor(props) {
    super(props);
    this.startPrivateChat = this.startPrivateChat.bind(this);
  }

  async checkChatRoomExists(participants) {
    /**
     * Given a list of participants, check to see if this chatRoom already exists.
     * @param {string[]} participants - list of usernames for users in the room
     * @return {string} roomId - id of the chat room if found, otherwise empty string
     */
    let res = await firebase
      .firestore()
      .collection("rooms")
      .where("participants", "==", participants)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          let result = "";
          qs.forEach((doc) => {
            result = doc.id;
          });
          return result;
        } else {
          return "";
        }
      });
    return res;
  }

  async setRoomId(participants, roomId) {
    /**
     * Set the roomId to the lists of each user in this room
     * @param {string} roomId - id of the chat room
     * @param {string[]} participants - list of usernames for users in the room
     */
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "in", participants)
      .get()
      .then(function (qs) {
        qs.forEach(function (doc) {
          firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .update({
              roomIds: firebase.firestore.FieldValue.arrayUnion(roomId),
            });
        });
      });
    return res;
  }

  async openChatRoom(participants) {
    /**
     * Find and open a chat room containing the list of participants
     * given. If no chat room exists, create a new chat room with these
     * participants. Will call the parent handler to switch to the found
     * chat room.
     * @param {string[]} participants - list of usernames for users in the room
     */
    let chatRoomId = await this.checkChatRoomExists(participants);
    console.log("chat room name: " + chatRoomId);
    if (!chatRoomId) {
      console.log("Creating new chat room!");
      // create a new chat room
      let roomId = await firebase
        .firestore()
        .collection("rooms")
        .add({
          participants: participants,
        })
        .then((roomRef) => roomRef.id);
      this.setRoomId(participants, roomId);
      chatRoomId = roomId;
    }
    this.props.handler(chatRoomId, this.user);
  }

  startPrivateChat() {
    /**
     * Open a chat room given a list of participants
     * @param {string[]} user - username of the target user
     * @param {string[]} myUser - username of the current user
     */
    console.log("starting private chat");
    let participants = [
      this.props.myUser.username,
      this.props.user.username,
    ].sort();
    this.openChatRoom(participants);
  }

  render() {
    return (
      <>
        <div className="user" onClick={this.startPrivateChat}>
          <a
            href="# "
            className="list-group-item list-group-item-action list-group-item-secondary justify-content-between d-flex"
          >
            <h5 className="mb-1">{this.props.user.displayName}</h5>
            <small className="text-muted">
              @{this.props.user.username}
              {/* <br/>
            <br/>
            {this.props.user.online ? "online" : "offline"} */}
            </small>
            {/* <br/>
            <small>{this.props.user.online ? "online" : "offline"}</small> */}
          </a>
        </div>
      </>
    );
  }
}

export default withRouter(User);
