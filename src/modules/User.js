import React from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase/app";

/**
 * This is the User Component used to handle the user actions in the user list
 * such as starting a chat with another user.
 * @hideconstructor
 */
class User extends React.Component {
  constructor(props) {
    super(props);
    this.startPrivateChat = this.startPrivateChat.bind(this);
  }

  /**
   * Create a new chat room for participants
   * @param {string[]} participants - list of usernames for [users]{@link _User} in a [room]{@link _Room}
   * @return {string} id of the newly created chat [room]{@link _Room}
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
  } /* createRoom */

  /**
   * Find and open a chat room containing the list of participants
   * given. If no chat room exists, create a new chat room with these
   * participants. Will call the parent handler to switch to the found
   * chat room.
   * @param {string[]} participants - list of usernames for [users]{@link _User} in a [room]{@link _Room}
   */
  async openChatRoom(participants) {
    let chatRoomId = await this.props.checkChatRoomExists(participants);
    if (!chatRoomId) {
      const roomId = await this.createRoom(participants);
      await this.setRoomId(participants, roomId);
      // get the new chat room id
      chatRoomId = roomId;
    }
    // bind enterRoom parameters
    this.props.enterRoom(chatRoomId, this.props.targetUser.displayName);
  } /* openChatRoom */

  /**
   * Set the roomId to the lists of each user in this chat room
   * @param {string} roomId - id of the [room]{@link _Room}
   * @param {string[]} participants - list of usernames for [users]{@link _User} in the [room]{@link _Room}
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
  } /* setRoomId */

  /**
   * Open a chat room given two participants
   * @param {string} targetUsername - username of the target [user]{@link _User}
   * @param {string} username - username of the current [user]{@link _User}
   */
  startPrivateChat(targetUsername, username) {
    let participants = [targetUsername, username].sort();
    this.openChatRoom(participants);
  } /* startPrivateChat */

  render() {
    return (
      <a
        href="# "
        className="user list-group-item list-group-item-action list-group-item-secondary justify-content-between d-flex"
        onClick={() =>
          this.startPrivateChat(
            this.props.targetUser.username,
            this.props.user.username
          )
        }
      >
        <h5 className="mb-1 truncate">{this.props.targetUser.displayName}</h5>
        <small className="text-muted truncate">
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
