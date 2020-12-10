import React from "react";
import { ReactComponent as EnterButton } from "../enter.svg";
import { addEmoji, toggleEmojiPicker } from "../utils/emoji.js";
import EmojiPicker from "../utils/emoji.js";
import data from "emoji-mart/data/apple.json";

/**
 * This is the ChatInput Component for the ChatRoom
 */
class ChatInput extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
    this.addEmoji = addEmoji.bind(this);
    this.toggleEmojiPicker = toggleEmojiPicker.bind(this);
    this.state = {
      showEmojiPicker: false,
    };
  }

  render() {
    return (
      <div className="chat-input">
        {this.state.showEmojiPicker && (
          <EmojiPicker
            onClickOutside={() => this.toggleEmojiPicker()}
            title={"Pick your emoji"}
            emoji={"point_up"}
            data={data}
            style={{ position: "absolute", bottom: "2.7rem", right: "0" }}
            set="apple"
            onSelect={this.addEmoji}
            showPreview={false}
            showSkinTones={false}
          />
        )}
        <form onSubmit={this.props.handleSubmit}>
          <div className="input-group chat-box">
            <input
              className="form-control"
              type="text"
              value={this.props.message}
              onChange={this.props.handleChange}
              placeholder="Potatoes can't talk... but you can!"
              ref={this.inputRef}
            />
            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-warning ignore-react-onclickoutside"
                id="show-emoji-yes"
                onClick={() => this.toggleEmojiPicker()}
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
