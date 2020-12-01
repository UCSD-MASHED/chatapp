import React from "react";
//import firebase from 'firebase/app';
//import 'firebase/auth';
import { withRouter } from "react-router-dom";

/**
 * This is the ChatMessage Component
 */
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
    const messageClass =
      this.state.messageUsername === this.state.username ? "sent" : "received";
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
