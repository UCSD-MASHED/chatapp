import React from "react";
import User from "./User";

class People extends React.Component {
  render() {
    return (
      <div className="user-list-wrapper">
        <h3>People</h3>
        <input
          className="form-control"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={this.props.keyword}
          onChange={this.props.handleSearchChange}
          style={{ marginBottom: "1rem" }}
        />
        <div className="list-group">
          {this.props.users &&
            this.props.users.map((otherUser, i) => (
              <User
                key={i}
                targetUser={otherUser}
                user={this.props.user}
                handleChangeRoom={this.props.handleChangeRoom}
                checkChatRoomExists={this.props.checkChatRoomExists}
              />
            ))}
        </div>
      </div>
    );
  }
}

export default People;
