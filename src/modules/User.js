import React from "react";
import { withRouter } from "react-router-dom";

class User extends React.Component {
  constructor(props) {
    super(props);
    this.startPrivateChat = this.startPrivateChat.bind(this);
  }

  startPrivateChat() {
    // TODO: create a room
    console.log(this.props.user);
  }

  render() {
    return (
      <>
        <div className="user" onClick={this.startPrivateChat}>
          <a
            href="/#"
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
