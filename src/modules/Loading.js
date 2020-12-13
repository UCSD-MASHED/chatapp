import React from "react";

/**
 * This is the Loading Component used to display the loading screen during
 * page transitions.
 */
class Loading extends React.Component {
  render() {
    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }
}

export default Loading;
