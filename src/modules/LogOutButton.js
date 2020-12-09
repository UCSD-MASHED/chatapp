import React from "react";

/**
 * This is the LogOutButton Component
 */
class LogOutButton extends React.Component {
  render() {
    return (
      <button
        type="button"
        style={{ float: "right" }}
        className="btn btn-warning btn-sm"
        onClick={() => this.props.logout()}
      >
        Log out
      </button>
    );
  }
}

export default LogOutButton;
