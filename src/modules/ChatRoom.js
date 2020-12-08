import React, { createRef } from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import User from "./User";
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
      otherUser: null,
      users: [],
      keyword: "",
      roomName: "Chat Room",
      roomId: null,
      loading: true,
    };
    this.dummy = createRef();
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleChangeRoom = this.handleChangeRoom.bind(this);
  }

  async componentDidMount() {
    if (!this.state.user) {
      this.props.history.replace("/");
    } else {
      await this.getUsers(this.state.user.username).then((users) => {
        this.setState({ users: users });
      });
      await this.getFirstRoom();

      this.getInitMessages().then(() => {
        this.scrollToBottom();
      });

      this.getMessages();

      this.setState({ loading: false });
    }
  }

  handleChange(event) {
    event.preventDefault();
    this.setState({ message: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.checkUserInRoom()) {
      this.sendMessage();
    }
  }

  handleSearchChange(event) {
    event.preventDefault();
    this.setState({ keyword: event.target.value }, () => {
      this.searchPrefix(this.state.keyword, this.state.user.username).then(
        (users) => {
          this.setState({ users: users });
        }
      );
    });
  }

  handleChangeRoom(roomId, otherUser) {
    this.setState({
      otherUser: otherUser,
      roomId: roomId,
      roomName: otherUser.displayName,
      messages: [],
    });
    this.getInitMessages().then(() => {
      this.scrollToBottom();
    });

    this.getMessages().then(() => {
      this.scrollToBottom();
    });
  }

  /**
   * Get all the users excluding the current user
   * @param {string} userName - The username of the current user
   * @return {user[]} list of the users excluding the current user
   */
  async getUsers(userName) {
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
  }

  /**
   * Return whether or not the current user is in the current room
   * @param {string} username - username of the current user
   * @param {string} roomId - id of the chat room
   * @return {boolean} true or false if the user is in the chat room
   */
  async checkUserInRoom() {
    let username = this.state.user.username;
    let roomId = this.state.roomId;

    if (!roomId) {
      return false;
    }

    await firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .where("roomIds", "array-contains", roomId)
      .get()
      .then((qs) => {
        return !qs.empty;
      });
  }

  /**
   * On chat room load, open the chat log for the first user in the list
   * if there exists a chat between the first user and the current user
   * @param {string} firstUser - username of the first user in the list of other users
   * @param {string} username - username of the current user
   */
  async getFirstRoom() {
    if (this.state.users.empty) {
      return;
    }
    let firstUser = this.state.users[0];
    let participants = [this.state.user.username, firstUser.username].sort();

    await firebase
      .firestore()
      .collection("rooms")
      .where("participants", "==", participants)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          qs.forEach((doc) => {
            this.setState({
              otherUser: firstUser,
              roomName: firstUser.displayName,
              roomId: doc.id,
            });
          });
        }
      });
  }

  /**
   * Update user timestamp and append message to room of messages.
   * @param {string} message - message to be sent
   * @param {string} roomId - id of the chat room
   * @param {string} username - username of the current user
   */
  async sendMessage() {
    let message = this.state.message;
    let username = this.state.user.username;
    let roomId = this.state.roomId;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let newMessage = {
      message: message,
      timestamp: timestamp,
      username: username,
    };

    if (!roomId) {
      return;
    }

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
  }

  /**
   * Fetch the messages of the chat room
   * @param {string} roomId - id of the chat room
   * @return {string[]} messages - list of strings of messages found
   */
  async getInitMessages() {
    let roomId = this.state.roomId;
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
      });
  }

  /**
   * Create a listener for a chat room to fetch messages upon updates to
   * the database
   * @param {string} roomId - id of the chat room
   */
  async getMessages() {
    let roomId = this.state.roomId;
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
  }

  /**
   * Helper function to scroll to the bottom of the chat room
   */
  scrollToBottom() {
    if (this.dummy.current) {
      this.dummy.current.scrollIntoView();
    }
  }

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

  render() {
    return this.state.loading ? (
      <Loading />
    ) : (
      <div className="main">
        <div className="user-list-wrapper">
          <h3>People</h3>
          <input
            className="form-control"
            type="search"
            placeholder="Search"
            aria-label="Search"
            value={this.state.keyword}
            onChange={this.handleSearchChange}
            style={{ marginBottom: "1rem" }}
          />
          <div className="list-group">
            {this.state.users &&
              this.state.users.map((user, i) => (
                <User
                  key={i}
                  user={user}
                  myUser={this.state.user}
                  handler={this.handleChangeRoom}
                />
              ))}
          </div>
        </div>
        <div className="chat-wrapper">
          <button
            type="button"
            style={{ float: "right" }}
            className="btn btn-warning btn-sm"
            onClick={() => this.logout()}
          >
            Log out
          </button>
          <h3 data-testid="room-name">{this.state.roomName}</h3>
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
                className="btn btn-primary btn-block mt-2"
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
