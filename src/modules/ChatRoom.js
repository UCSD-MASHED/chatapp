import React from "react";
import firebase from "firebase/app";
import { withRouter } from "react-router-dom";
import ChatMessage from "./ChatMessage.js";
import "../App.css" // needs to change
//import { Helmet } from "react-helmet";
//import '../firebase/firestore';

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    //this.getMessages = this.getMessages.bind(this);
    this.state = {
      message: "",
      roomName: "test_room",
      messages: [],//this.getMessages("test_room"),
      user: props.location.state.user,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    //this.setMessages();
    //this.setMessages();
  }

  // listenMessages() {
  //   this.messageRef
  //     .limitToLast(10)
  //     .on('value', message => {
  //       this.setState({
  //         list: Object.values(message.val()),
  //       });
  //     });
  // }

  // componentWillMount() {
  //   // const username = localStorage.getItem('chat_username');
  //   // this.setState({username: username ? username : 'Unknown'})
  //   // const messagesRef = database.ref('messages')
  //   //   .orderByKey()
  //   //   .limitToLast(100);
  //   let roomName = this.state.roomName;
  //   const messagesRef = firebase.firestore().collection("rooms").doc(roomName).collection("messages").orderBy("timestamp", "desc").limit(5);
  //   console.log(messagesRef);

  //   // messagesRef.on('value', snapshot => {
  //   //   let messagesObj = snapshot.val();
  //   //   let messages = [];
  //   //   Object.keys(messagesObj).forEach(key =>  messages.push(messagesObj[key]));
  //   //   messages = messages.map((msg) => { return {message: msg.message, timestamp: msg.timestamp, userId: msg.userId}})
  //   //   this.setState(prevState => ({
  //   //     messages: messages,
  //   //   }));
  //   // });

  //   messagesRef.get().then(querySnapshot => {
  //       const msgs = [];
  
  //       querySnapshot.forEach(function(doc) {
  //         msgs.push({
  //           message: doc.data().message,
  //           timestamp: doc.data().timestamp,
  //           userId: doc.data().username
  //         });
  //       });
  
  //       this.setState({ messages: msgs });
  //     })
  //     .catch(function(error) {
  //       console.log("Error getting documents: ", error);
  //     });
  // }

  zgetMessages() {
    let roomName = this.state.roomName;
    // const messagesRef = await firebase
    //   .firestore()
    //   .collection('rooms')
    //   .doc(roomName)
    //   .collection("messages")
    const messagesRef = firebase.firestore().collection("rooms").doc(roomName).collection("messages");
    const query = messagesRef.orderBy("timestamp", "desc").limit(5); // TODO: update limit later
    console.log(query)
    //  query.get().then(snapshot => {
    //    snapshot.forEach(message => {
    //      //console.log("one message: ");
    //      //console.log(message.data() );
    //      this.state.messages.push(message)
    //    });
    //  });
    //  console.log(this.state.messages.length)
     
    // var i;
    // for (i = 0; i < this.state.messages.length; i++) {
    //    console.log(this.state.messages[i]);
    // }
    //console.log("hello")
    // console.log(typeof query)
    // messagesRef.on('value', message => {
    //   this.setState({
    //     messages: Object.values(message.val()),
    //   });
    // });
    // var res = await firebase
    //   .firestore()
    //   .collection("rooms")
    //   .doc(roomName)
    //   .collection("messages")
    //   .get();
    //return res;
    // console.log(typeof res)
    // console.log("HELLOOOOO")
    // res.then(snapshot => {
    //   snapshot.forEach(doc => {
    //     console.log("one message: ");
    //     console.log(doc.data() );
    
    //   });
    // });
    
  }

  async getMessages(roomName) {
    //let roomName = this.state.roomName;
    const messagesRef = firebase.firestore().collection("rooms").doc(roomName).collection("messages");
    const query = messagesRef.orderBy("timestamp").limit(5); 
    // query.get().then((snapshot) => (
    //     snapshot.forEach((doc) => (
    //         this.setState((prevState) => ({
    //             messages: [...prevState.messages, {
    //                 //postID: doc.id,
    //                 //title: doc.data().title,
    //                 //body: doc.data().body,
    //                 //featured: doc.data().featured
    //                 message: doc.data().message,
    //                 timestamp: doc.data().timestamp,
    //                 userId: doc.data().username
    //             }]
    //         }))
    //     ))
    // ))
    query.get().then(querySnapshot => {
      const msgs = [];

      querySnapshot.forEach(function(doc) {
        msgs.push({
          message: doc.data().message,
          timestamp: doc.data().timestamp,
          userId: doc.data().username
        });
      });

      //this.setState({ messages: msgs });
      //this.state.messages = msgs;
      return msgs;
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
 }

  componentDidMount = () => {
    let roomName = this.state.roomName;
    const messagesRef = firebase.firestore().collection("rooms").doc(roomName).collection("messages");
    const query = messagesRef.orderBy("timestamp", "desc").limit(5); 
    // query.get().then((snapshot) => (
    //     snapshot.forEach((doc) => (
    //         this.setState((prevState) => ({
    //             messages: [...prevState.messages, {
    //                 //postID: doc.id,
    //                 //title: doc.data().title,
    //                 //body: doc.data().body,
    //                 //featured: doc.data().featured
    //                 message: doc.data().message,
    //                 timestamp: doc.data().timestamp,
    //                 userId: doc.data().username
    //             }]
    //         }))
    //     ))
    // ))
    query.get().then(querySnapshot => {
      const msgs = [];

      querySnapshot.forEach(function(doc) {
        msgs.push({
          message: doc.data().message,
          timestamp: doc.data().timestamp,
          userId: doc.data().username
        });
      });

      this.setState({ messages: msgs });
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
 }

  handleChange(event) {
    this.setState({ message: event.target.value });
    console.log(this.state.messages)
    var i;
     for (i = 0; i < this.state.messages.length; i++) {
        console.log(this.state.messages[i]);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.checkUserInRoom()) {
      this.sendMessage();
    }
  }

  async checkUserInRoom() {
    /*
     * Query by roomName and userName to check if the
     * user is in this chatroom.
     */
    let username = this.state.user.username;
    let roomName = this.state.roomName;

    var res = await firebase
      .firestore()
      .collection("rooms")
      .where("roomName", "==", roomName)
      .where("participants", "array-contains", username)
      .get()
      .then((qs) => {
        return !qs.empty;
      });
    return res;
  }

  async sendMessage() {
    /*
     *
     */
    let message = this.state.message;
    let username = this.state.user.username;
    let roomName = this.state.roomName;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomName)
      .set({ username: timestamp });

    await firebase
      .firestore()
      .collection("rooms")
      .doc(roomName)
      .collection("messages")
      .add({
        message: message,
        timestamp: timestamp,
        userId: username
      });
      this.setState({ message: '' }); // set message bar text back to placeholder (empty)
  }
//{/* {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)} */}
  render() {
    return (
      <>
        <main>
          {this.state.messages && this.state.messages.length > 0 && this.state.messages.reverse().map((msg, i) =>
            <ChatMessage key={i} message={msg} />
          )}
        </main>

        <form onSubmit={this.handleSubmit}>
          <input
            value={this.state.message}
            onChange={this.handleChange}
            placeholder="Potatoes can't talk... but you can!"
          />

          <button type="submit" disabled={!this.state.message}>
            🕊️
          </button>
        </form>
      </>
    );
  }
}

export default withRouter(ChatRoom);
