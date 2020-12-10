import { NimblePicker } from "emoji-mart";
import onClickOutside from "react-onclickoutside";
import "emoji-mart/css/emoji-mart.css";

class EmojiPicker extends NimblePicker {
  handleClickOutside = (evt) => {
    this.props.onClickOutside();
  };
}

export default onClickOutside(EmojiPicker);

export function toggleEmojiPicker() {
  this.setState({
    showEmoji: !this.state.showEmoji,
  });
}

export function addEmoji(emoji) {
  const message = this.props.message;
  const input = this.inputRef.current;
  const selectStart = input.selectionStart;
  const start = message.substring(0, selectStart);
  const end = message.substring(selectStart);
  const text = start + emoji.native + end;
  const emoLen = emoji.native.length;

  // manually trigger on change event
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;
  // update value in this way to trigger onchange
  nativeInputValueSetter.call(input, text);
  var event = new Event("input", { bubbles: true });
  input.dispatchEvent(event);

  input.focus();
  input.setSelectionRange(selectStart + emoLen, selectStart + emoLen);
}
