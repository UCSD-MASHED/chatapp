import firebase from "firebase/app";
import "firebase/firestore";

describe("Chat room messages and room change", () => {
  let users;
  let rooms;
  let messagesToSendFromLoginUser;
  let messageToSendFromTestUser1;
  let messageToSendFromTestUser2;

  before(() => {
    // create test users
    cy.fixture("users").then((json) => {
      users = json;
      users.forEach((user) => {
        cy.callFirestore("set", `users/${user.uid}`, user);
      });
    });
    // create test rooms
    cy.fixture("rooms").then((json) => {
      rooms = json;
      rooms.forEach((room) => {
        // create test messages for each test room
        cy.callFirestore("set", `rooms/${room.uid}`, room);
        let messages = room.messages;
        messages.forEach((message) => {
          // Set timestamp for each message of the the test rooms
          const timestamp = firebase.firestore.Timestamp.now();
          message.timestamp = timestamp;
          cy.log(message.message);
          cy.callFirestore(
            "set",
            `rooms/${room.uid}/messages/${message.uid}`,
            message
          );
        });
      });
    });

    // get messages that loginUser and test users will send
    cy.fixture("messagesToSend").then((json) => {
      messagesToSendFromLoginUser = json.messagesToSendFromLoginUser;

      messageToSendFromTestUser1 = json.messageToSendFromTestUser1;
      messageToSendFromTestUser1.timestamp = firebase.firestore.Timestamp.now();

      messageToSendFromTestUser2 = json.messageToSendFromTestUser2;
      messageToSendFromTestUser2.timestamp = firebase.firestore.Timestamp.now();
    });
  });

  after(() => {
    // delete test users
    users.forEach((user) => {
      cy.callFirestore("delete", `users/${user.uid}`);
    });

    rooms.forEach((room) => {
      // delete test messages in test rooms
      cy.callFirestore("delete", `rooms/${room.uid}/messages`);
      // delete test rooms
      cy.callFirestore("delete", `rooms/${room.uid}`);
    });
  });

  beforeEach(() => {
    cy.visit("/");
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it("Choose a chat room and check room name and messages load", () => {
    cy.contains("Chat Room");
    const testUser1DisplayName = users[0].displayName;
    cy.get(".list-group").find(".user").contains(testUser1DisplayName).click();
    cy.get('[data-testid="room-name"]').contains(testUser1DisplayName);
    const messages = rooms[0].messages;
    messages.forEach((message) => {
      cy.contains(message.message);
    });
  });

  it("Can't send message to non-existent room", () => {
    cy.contains("Chat Room");
    const message = messagesToSendFromLoginUser[0].message;
    cy.get("input[type='text']").type(message);
    cy.get("button").contains("Send").click();
    // after clicking, message should not send
    cy.get("input[type='text']").should("have.value", message);
  });

  it("Load and exchange messages with two different users", () => {
    cy.contains("Chat Room");

    // Go to test room 1 with test user 1 and check room name
    const testUser1DisplayName = users[0].displayName;
    cy.get(".list-group").find(".user").contains(testUser1DisplayName).click();
    cy.get('[data-testid="room-name"]').should(
      "have.text",
      testUser1DisplayName
    );
    // "Send" a message from test user 1 and check that it renders
    cy.callFirestore(
      "set",
      `rooms/${rooms[0].uid}/messages/${messageToSendFromTestUser1.uid}`,
      messageToSendFromTestUser1
    );
    cy.contains(messageToSendFromTestUser1.message);
    // Send a message from the current user and check that the form clears and sent message renders
    const messageFromLoginUserToTestUser1 =
      messagesToSendFromLoginUser[0].message;
    cy.get("input[type='text']").type(messageFromLoginUserToTestUser1);
    cy.get("button").contains("Send").click();
    cy.get("input[type='text']").should("have.value", "");
    cy.contains(messageFromLoginUserToTestUser1);

    // Go to test room 2 with test user 2 and check room name
    const testUser2DisplayName = users[1].displayName;
    cy.get(".list-group").find(".user").contains(testUser2DisplayName).click();
    cy.get('[data-testid="room-name"]').contains(testUser2DisplayName);
    // "Send" a message from test user 2 and check that it renders
    cy.callFirestore(
      "set",
      `rooms/${rooms[1].uid}/messages/${messageToSendFromTestUser2.uid}`,
      messageToSendFromTestUser2
    );
    cy.contains(messageToSendFromTestUser2.message);
    // Send a message from the current user and check that the form clears and sent message renders
    const messageFromLoginUserToTestUser2 =
      messagesToSendFromLoginUser[1].message;
    cy.get("input[type='text']").type(messageFromLoginUserToTestUser2);
    cy.get("button").contains("Send").click();
    cy.get("input[type='text']").should("have.value", "");
    cy.contains(messageFromLoginUserToTestUser2);
  });
});
