import React, { createRef } from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import People from "./People";
import LogOutButton from "./LogOutButton";
import ChatInput from "./ChatInput";
import Loading from "./Loading";

/**
 * This is the ChatRoom Component
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
    this.handleChange = this.handleChange.bind(this);
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
          await this.enterRoom(roomId, firstUser);
        }
      }
      this.setState({ loading: false, users: users });
    }
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ message: event.target.value });
  }

  handleChangeSearch(event) {
    event.preventDefault();
    this.setState({ keyword: event.target.value }, () => {
      this.searchPrefix(this.state.keyword, this.state.user.username).then(
        (users) => {
          this.setState({ users: users });
        }
      );
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const message = this.state.message;
    const username = this.state.user.username;
    const roomId = this.state.roomId;
    if (this.checkUserInRoom(username, roomId)) {
      this.sendMessage(message, roomId, username);
    }
  }

  /**
   * Given a list of participants, check to see if this chat room already exists.
   * @param {string[]} participants - list of usernames for users in the room which may not exist
   * @return {string|null} room id of the chat room if found, otherwise null
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
   * @param {string} username - username of the current user
   * @param {string} roomId - id of the chat room
   * @return {boolean} true if the user is in the chat room, else false
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
   * @param {string} roomId - id of the chat room
   * @param {Object} otherUser - the other user to be chatted with
   * @param {string} otherUser.displayName - displayed name of the other user
   */
  async enterRoom(roomId, otherUser) {
    this.setState({
      roomId: roomId,
      roomName: otherUser.displayName,
    });
    await this.getInitMessages(roomId);
    await this.getMessages(roomId);
  }

  /**
   * Fetch the messages of the chat room
   * @param {string} roomId - id of the chat room
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
   * Create a listener for a chat room to fetch messages upon updates to
   * the database
   * @param {string} roomId - id of the chat room
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
   * @param {string} username - The username of the current user
   * @return {user[]} list of the users excluding the current user
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
   * @param {string} username - username of the current user
   * @param {string} keyword - prefix of username to search for
   * @return {user[]} list of users whose username matches keyword
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
   * Update user timestamp and append message to room of messages.
   * @param {string} message - message to be sent
   * @param {string} roomId - id of the chat room
   * @param {string} username - username of the current user
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
  }

  /**
   * Helper function to scroll to the bottom of the chat room
   */
  scrollToBottom() {
    if (this.dummy.current) {
      this.dummy.current.scrollIntoView();
    }
  }

  render() {
    return this.state.loading ? (
      <Loading />
    ) : (
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
          <LogOutButton logout={this.logout} />
          <h3 className="truncate" data-testid="room-name">
            {this.state.roomName}
          </h3>
          <div className="chat-messages">
            {this.state.messages &&
              this.state.messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  username={this.state.user.username}
                />
              ))}
            <span ref={this.dummy}></span>
          </div>
          <ChatInput
            message={this.state.message}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(ChatRoom);
