import React from "react";

/**
 * This is the LogOutButton Component used to render the logout button.
 * @hideconstructor
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
        Log Out
      </button>
    );
  }
}

export default LogOutButton;
