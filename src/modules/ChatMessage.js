import React from "react";
//import firebase from 'firebase/app';
//import 'firebase/auth';
import { withRouter } from "react-router-dom";

class ChatMessage extends React.Component {
    constructor(props) {
        super(props);
        //this.message = props.message;
        //this.user = props.location.state.user
        //this.messageClass = "sent"//props.userId === "test_user"/*auth.currentUser.uid*/ ? 'sent' : 'received';
        this.state = {
            message: props.message,
            senderId: props.message.userId,
            messageClass: "sent"//props.senderId === firebase.auth().currentUser.uid ? 'sent' : 'received'
          };
    }

    render() {
        const message = this.state.message;
        const messageClass = this.state.messageClass;
        //console.log("hi")
        console.log(this.state.message)
        //console.log(firebase.auth().currentUser.uid)
        return (
            <>
                <div className={`message ${messageClass}`}>
                    <p>{message.message}</p>
                </div>
            </>
        );
    }
}

export default withRouter(ChatMessage);
