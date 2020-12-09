import React from "react";
import { ReactComponent as EnterButton } from "../enter.svg";

/**
 * This is the ChatInput Component for the ChatRoom
 */
class ChatInput extends React.Component {
  render() {
    return (
      <div className="chat-input">
        <form onSubmit={this.props.handleSubmit}>
          {/* {this.state.showEmoji ? (
                  <EmojiPicker onClickOutside={() => this.toggleEmojiPicker()} title={'Pick your emoji'} emoji={'point_up'} data={data} style={{ position: "absolute", bottom: "100px", right: "0" }} set="apple" onSelect={this.addEmoji} />
              ) : null} */}

          <div className="input-group chat-box">
            <input
              className="form-control"
              type="text"
              value={this.props.message}
              onChange={this.props.handleChange}
              placeholder="Potatoes can't talk... but you can!"
            />
            <div className="input-group-append">
              {/* onClick={() => this.toggleEmojiPicker()}  */}
              <button
                type="button"
                className="btn btn-warning"
                id="show-emoji-yes"
              >
                {"😃"}
              </button>
              <button
                disabled={!this.props.message}
                type="submit"
                className="btn btn-success btn-block"
                title="Send"
              >
                <EnterButton />
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default ChatInput;
