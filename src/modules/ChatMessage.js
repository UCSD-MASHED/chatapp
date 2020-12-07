import React from "react";
import { withRouter } from "react-router-dom";

/**
 * This is the ChatMessage Component
 */
class ChatMessage extends React.Component {
  getTime(timestamp) {
    timestamp = timestamp * 1000;
    const date = new Date(timestamp);

    var options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "2-digit",
      day: "2-digit",
      timeZone: "America/Los_Angeles",
    };
    return date.toLocaleString("en-US", options);
  }

  render() {
    const message = this.props.message;
    const messageClass =
      this.props.message.username === this.props.username ? "sent" : "received";
    return (
      <>
        <div className={`message ${messageClass}`}>
          <p>{message.message}</p>
          <span className={`message-time-${messageClass}`}>
            {this.getTime(message.timestamp.seconds)}
          </span>
        </div>
      </>
    );
  }
}

export default withRouter(ChatMessage);
