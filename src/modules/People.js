import React from "react";
import User from "./User";

/**
 * This is the People Component used to render the list of users except current user
 */
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
          onChange={this.props.handleChangeSearch}
          style={{ marginBottom: "1rem" }}
        />
        <div className="list-group">
          {this.props.users &&
            this.props.users.map((otherUser, i) => (
              <User
                key={i}
                targetUser={otherUser}
                user={this.props.user}
                checkChatRoomExists={this.props.checkChatRoomExists}
                enterRoom={this.props.enterRoom}
              />
            ))}
        </div>
      </div>
    );
  }
}

export default People;
