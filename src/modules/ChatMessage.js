import React from "react";
//import firebase from 'firebase/app';
//import 'firebase/auth';
import { withRouter } from "react-router-dom";

class ChatMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: props.message,
      messageUsername: props.message.username,
      username: props.username,
    };
  }

  render() {
    const message = this.state.message;
    const messageClass = this.state.messageUsername === this.state.username ? 'sent' : 'received';
    console.log("chat messages: " + this.state.message.message + " " + this.state.messageUsername);
    console.log("messageClass " + messageClass);
    return (
      <>
        <div className={`message ${messageClass}`}>
          <p>{message.message}</p>
        </div>
      </>
    );
  }
}

export default withRouter(ChatMessage);
