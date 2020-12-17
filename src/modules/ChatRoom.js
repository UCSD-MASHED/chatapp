import React, { createRef } from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import People from "./People";
import LogOutButton from "./LogOutButton";
import ChatInput from "./ChatInput";
import Loading from "./Loading";

/**
 * This is the ChatRoom Component used to render the chat room and handle user
 * actions such as sending messages, searching for users to chat with, and starting
 * new chats. A ChatRoom houses all of a users private chats, not just one chat
 * with another user.
 * @hideconstructor
 */
class ChatRoom extends React.Component {
  constructor(props) {
    super(props);

    let user = null;
    if (props.location && props.location.state && props.location.state.user) {
      user = props.location.state.user;
    }

    this.state = {
      message: "",
      messages: [],
      user: user,
      users: [],
      keyword: "",
      roomName: "Chat Room",
      roomId: null,
      loading: true,
    };
    this.dummy = createRef();
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkChatRoomExists = this.checkChatRoomExists.bind(this);
    this.enterRoom = this.enterRoom.bind(this);
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    if (!this.state.user) {
      this.props.history.replace("/");
    } else {
      const username = this.state.user.username;
      const users = await this.getUsers(username);
      if (!users.empty) {
        // On chat room load, open the chat room for the first user in the list
        // if there exists a chat between the first user and the current user
        const firstUser = users[0];
        const participants = [username, firstUser.username].sort();
        const roomId = await this.checkChatRoomExists(participants);
        if (roomId) {
          await this.enterRoom(roomId, firstUser.displayName);
        }
      }
      this.setState({ loading: false, users: users });
    }
  }

  /**
   * Handles message input change, updates state accordingly.
   * @param {Object} event - an Event object
   */
  handleChangeInput(event) {
    event.preventDefault();
    this.setState({ message: event.target.value });
  } /* handleChangeInput */

  /**
   * Handles user search input change, triggers {@link ChatRoom#searchPrefix} search on input change
   * @param {Object} event - an Event object
   */
  handleChangeSearch(event) {
    event.preventDefault();
    this.setState({ keyword: event.target.value }, () => {
      this.searchPrefix(this.state.keyword, this.state.user.username).then(
        (users) => {
          this.setState({ users: users });
        }
      );
    });
  } /* handleChangeSearch */

  /**
   * Handles message submit, triggers {@link ChatRoom#sendMessage}
   * @param {Object} event - an Event object
   */
  handleSubmit(event) {
    event.preventDefault();
    const message = this.state.message;
    const username = this.state.user.username;
    const roomId = this.state.roomId;
    if (this.checkUserInRoom(username, roomId)) {
      this.sendMessage(message, roomId, username);
    }
  } /* handleSubmit */

  /**
   * Given a list of participants, check to see if this chat room already exists.
   * @param {string[]} participants - list of usernames for [users]{@link _User} in the [room]{@link _Room} which may not exist
   * @return {string|null} room id of the [room]{@link _Room} if found, otherwise null
   */
  async checkChatRoomExists(participants) {
    let roomId = await firebase
      .firestore()
      .collection("rooms")
      .where("participants", "==", participants)
      .limit(1)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          const room = qs.docs[0];
          return room.id;
        } else {
          return null;
        }
      });
    return roomId;
  } /* checkChatRoomExists */

  /**
   * Return whether or not the current user is in the current room
   * @param {string} username - username of the current [user]{@link _User}
   * @param {string} roomId - id of the [room]{@link _Room}
   * @return {boolean} true if the current [user]{@link _User} is in the [room]{@link _Room}, else false
   */
  async checkUserInRoom(username, roomId) {
    if (!roomId) {
      return false;
    }
    var exist = await firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .where("roomIds", "array-contains", roomId)
      .get()
      .then((qs) => !qs.empty);
    return exist;
  } /* checkUserInRoom */

  /**
   * Enter the chat room with another user
   * @param {string} roomId - id of the [room]{@link _Room}
   * @param {string} roomName - displayed name of the other [user]{@link _User}
   */
  async enterRoom(roomId, roomName) {
    this.setState({
      roomId: roomId,
      roomName: roomName,
    });
    await this.getInitMessages(roomId);
    await this.getMessages(roomId);
  } /* enterRoom */

  /**
   * Fetch the list of [messages]{@link _Message} of the chat room
   * @param {string} roomId - id of the [room]{@link _Room}
   */
  async getInitMessages(roomId) {
    if (!roomId) {
      return;
    }
    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("messages")
      .orderBy("timestamp")
      .get()
      .then((snapshot) => {
        let msgs = [];
        snapshot.forEach((doc) => {
          msgs.push(doc.data());
        });
        this.setState({ messages: msgs });
        this.scrollToBottom();
      });
  } /* getInitMessages */

  /**
   * Append a new [message]{@link _Message} sent by the current user to the list of messages in a room
   * @param {string} roomId - id of the [room]{@link _Room}
   */
  async getMessages(roomId) {
    if (!roomId) {
      return;
    }
    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("messages")
      .orderBy("timestamp")
      .onSnapshot((snapshot) => {
        // make sure server timestamp is generated
        if (snapshot.metadata.hasPendingWrites) {
          // skip, wait for next one
          return;
        }
        var messages = [];
        snapshot.forEach((doc) => {
          messages.push(doc.data());
        });
        this.setState({ messages: messages });
        this.scrollToBottom();
      });
  } /* getMessages */

  /**
   * Get all the users excluding the current user
   * @param {string} username - username of the current [user]{@link _User}
   * @return {_User[]} list of the users excluding the current [user]{@link _User}
   */
  async getUsers(username) {
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "!=", username)
      .get()
      .then((docs) => {
        let users = [];
        docs.forEach((doc) => {
          users.push(doc.data());
        });
        return users;
      });
    return res;
  } /* getUsers */

  /**
   * Returns list of users whose username has a longest prefix
   * match of the input keyword
   * @param {string} username - username of the current [user]{@link _User}
   * @param {string} keyword - prefix of username to search for
   * @return {_User[]} list of users whose username matches keyword
   */
  async searchPrefix(keyword, username) {
    var res = await firebase
      .firestore()
      .collection("users")
      .where("username", "!=", username)
      .where("username", ">=", keyword)
      .where("username", "<=", keyword + "\uf8ff")
      .get()
      .then((docs) => {
        let users = [];
        docs.forEach((doc) => {
          users.push(doc.data());
        });
        return users;
      });
    return res;
  } /* searchPrefix */

  /**
   * Update user timestamp and append [message]{@link _Message} to room of messages.
   * @param {string} message - message to be sent
   * @param {string} roomId - id of the [room]{@link _Room}
   * @param {string} username - username of the current [user]{@link _User}
   */
  async sendMessage(message, roomId, username) {
    if (!roomId) {
      return;
    }

    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let newMessage = {
      message: message,
      timestamp: timestamp,
      username: username,
    };

    var timestampObj = {};
    timestampObj[username] = timestamp;
    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomId)
      .update(timestampObj);

    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("messages")
      .add(newMessage);

    this.setState({ message: "" }); // set message bar text back to placeholder (empty)
  } /* sendMessage */

  /**
   * Logs current user out and returns to landing page
   */
  logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.props.history.replace("/");
      });
  } /* logout */

  /**
   * Helper function to scroll to the bottom of the chat room
   */
  scrollToBottom() {
    if (this.dummy.current) {
      this.dummy.current.scrollIntoView();
    }
  } /* scrollToBottom */

  render() {
    return this.state.loading ? (
      <Loading />
    ) : (
        <div style={{ height: "100%" }}>
          <div className="chat-header">
            <span className="chat-title">
              <img
                className="tatertalk-chatroom"
                alt="icon"
                src={process.env.PUBLIC_URL + "/tatertalk_icon.png"}
              />
              <span>TaterTalk</span>
              <span className="logout-btn">
                <LogOutButton logout={this.logout} />
              </span>
            </span>
          </div>
          <div className="main">
            <People
              keyword={this.state.keyword}
              user={this.state.user}
              users={this.state.users}
              enterRoom={this.enterRoom}
              handleChangeSearch={this.handleChangeSearch}
              checkChatRoomExists={this.checkChatRoomExists}
            />
            <div className="chat-wrapper">
              <div className="chat-person">
                <h3 className="truncate" data-testid="room-name">
                  {this.state.roomName}
                </h3>
              </div>
              <div className="chat-messages">
                {this.state.messages.length > 0 ? (
                  this.state.messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      message={msg}
                      username={this.state.user.username}
                    />
                  ))
                ) : (
                    <div className="empty-chatroom">
                      <h2> Don't be a couch potato... </h2>
                      <h2> Click on a user to start a tateriffic talk! </h2>
                    </div>
                  )}
                <span ref={this.dummy}></span>
              </div>
              <ChatInput
                message={this.state.message}
                handleChange={this.handleChangeInput}
                handleSubmit={this.handleSubmit}
              />
            </div>
          </div>
        </div>
      );
  }
}

export default withRouter(ChatRoom);
