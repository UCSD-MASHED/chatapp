import React from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase/app";

/**
 * This is the User Component
 */
class User extends React.Component {
  constructor(props) {
    super(props);
    this.startPrivateChat = this.startPrivateChat.bind(this);
  }

  /**
   * Given a list of participants, check to see if this chatRoom already exists.
   * @param {string[]} participants - list of usernames for users in the room
   * @return {string} roomId - id of the chat room if found, otherwise empty string
   */
  async checkChatRoomExists(participants) {
    let roomId = await firebase
      .firestore()
      .collection("rooms")
      .where("participants", "==", participants)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          let room = qs.docs[0];
          return room.id;
        } else {
          return "";
        }
      });
    return roomId;
  }

  /**
   * Create a new chat room for participants
   * @param {string[]} participants - list of usernames for users in the room
   * @return {string} roomId - id of the newly created chat room
   */
  async createRoom(participants) {
    let roomId = await firebase
      .firestore()
      .collection("rooms")
      .add({
        participants: participants,
      })
      .then((roomRef) => roomRef.id);
    return roomId;
  }

  /**
   * Set the roomId to the lists of each user in this room
   * @param {string} roomId - id of the chat room
   * @param {string[]} participants - list of usernames for users in the room
   */
  async setRoomId(participants, roomId) {
    await firebase
      .firestore()
      .collection("users")
      .where("username", "in", participants)
      .get()
      .then((qs) => {
        qs.forEach((doc) => {
          firebase
            .firestore()
            .collection("users")
            .doc(doc.id)
            .update({
              roomIds: firebase.firestore.FieldValue.arrayUnion(roomId),
            });
        });
      });
  }

  /**
   * Find and open a chat room containing the list of participants
   * given. If no chat room exists, create a new chat room with these
   * participants. Will call the parent handler to switch to the found
   * chat room.
   * @param {string[]} participants - list of usernames for users in the room
   */
  async openChatRoom(participants) {
    let chatRoomId = await this.checkChatRoomExists(participants);
    if (!chatRoomId) {
      const roomId = await this.createRoom(participants);
      await this.setRoomId(participants, roomId);
      // get the new chat room id
      chatRoomId = roomId;
    }
    // bind handleChangeRoom parameters
    this.props.handler(chatRoomId, this.props.targetUser);
  }

  /**
   * Open a chat room given a list of participants
   * @param {string[]} targetUsername - username of the target user
   * @param {string[]} username - username of the current user
   */
  startPrivateChat(targetUsername, username) {
    let participants = [
      targetUsername,
      username
    ].sort();
    this.openChatRoom(participants);
  }

  render() {
    return (
      <a
        href="# "
        className="user list-group-item list-group-item-action list-group-item-secondary justify-content-between d-flex"
        onClick={() => this.startPrivateChat(this.props.targetUser.username, this.props.user.username)}
      >
        <h5 className="mb-1">{this.props.targetUser.displayName}</h5>
        <small className="text-muted">
          @{this.props.targetUser.username}
          {/* <br/>
          <br/>
          {this.props.user.online ? "online" : "offline"} */}
        </small>
        {/* <br/>
          <small>{this.props.user.online ? "online" : "offline"}</small> */}
      </a>
    );
  }
}

export default withRouter(User);
