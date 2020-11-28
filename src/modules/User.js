import React from "react";
import { withRouter } from "react-router-dom";
import firebase from "firebase/app";

class User extends React.Component {
  constructor(props) {
    super(props);
    this.startPrivateChat = this.startPrivateChat.bind(this);
  }

  async checkChatRoomExists(participants) {
    var res = await firebase
      .firestore()
      .collection("rooms")
      .where("participants", "==", participants)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          qs.forEach((doc) => {
            return doc.id;
          });
        }
        return !qs.empty;
      });
    return res;
  }

  async setRoomId(participants, roomId) {
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "in", participants)
      .get()
      .then(function (qs) {
        qs.forEach(function (doc) {
          firebase.firestore().collection("users").doc(doc.id).update({
            roomIds: firebase.firestore.FieldValue.arrayUnion(roomId)
          });
        });
      });
    return res;
  }

  async openChatRoom(participants) {
    let chatRoomId = await this.checkChatRoomExists(participants);
    console.log("chat room name: " + chatRoomId);
    if (!chatRoomId) {
      // create a new chat room 
      let roomId = await firebase
        .firestore()
        .collection("rooms").add({
          participants: participants,
        })
        .then(function (roomRef) {
          return roomRef.id;
        });
      await this.setRoomId(participants, roomId);
    }
    this.props.handler(chatRoomId, this.user);
  }

  startPrivateChat() {
    let participants = [this.props.myUser.username, this.props.user.username].sort();
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
