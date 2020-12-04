import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import ChatRoom from "../modules/ChatRoom";
import React from "react";
import firebase from "firebase/app";
import "../firebase";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

const user = {
  displayName: "Test user",
  online: true,
  roomIds: [],
  username: "test_user",
};

let firestoreMock;
let history;

beforeEach(() => {
  user.roomIds = [];

  history = createMemoryHistory();
  history.push("/chatRoom", { user: user });

  window.HTMLElement.prototype.scrollIntoView = function () {};
  firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: null,
    onSnapshot: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };
});

test("Cannot enter ChatRoom", async () => {
  history = createMemoryHistory();
  history.push("/chatRoom");
  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  // should redirect to login page
  await waitFor(() => expect(history.location.pathname).toEqual("/"));
});

test("Can log out", async () => {
  firebase.auth().signOut = jest
    .fn()
    .mockImplementation(() => Promise.resolve({}));
  const docData = {
    message: "MOCK_MESSAGE",
    timestamp: 0,
    username: "test_user",
  };
  const docResult = {
    data: () => docData,
  };
  firestoreMock.get = jest.fn(() => Promise.resolve([docResult]));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  const button = screen.getByText("Log out");
  fireEvent.click(button);
  await waitFor(() => expect(history.location.pathname).toEqual("/"));
});

test("Get messages and check if message is displayed on screen", async () => {
  // console.log("Starting test: Get message");

  const testRoomId = "test_room_id";
  user.roomIds = [testRoomId];
  const roomDocResult = {
    id: testRoomId,
  };

  const userDocResult = {
    data: () => user,
  };

  const otherUserDocData = {
    displayName: "Other test user",
    online: true,
    roomIds: [testRoomId],
    username: "other_test_user",
  };
  const otherUserDocResult = {
    data: () => otherUserDocData,
  };

  const testMessage = "MOCK_MESSAGE";
  const messageDocData = {
    message: testMessage,
    timestamp: 0,
    username: user.username,
  };
  const messageDocResult = {
    data: () => messageDocData,
  };

  firestoreMock.get = jest
    .fn()
    // first call in getUsers
    .mockResolvedValueOnce([userDocResult, otherUserDocResult])
    // second call in getFirstRoom
    .mockResolvedValueOnce([roomDocResult])
    // third call in getInitMessages, where there is only one message and it's from
    // the current user
    .mockResolvedValueOnce([messageDocResult]);
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  expect(history.location.pathname).toEqual("/chatRoom");

  await waitFor(() =>
    screen.getByPlaceholderText("Potatoes can't talk... but you can!")
  );

  const message = screen.getByText(testMessage);
  expect(message).toBeInTheDocument();
});

test("Send message button click tries to update database", async () => {
  const testRoomId = "test_room_id";
  user.roomIds = [testRoomId];

  const otherUserDocData = {
    displayName: "Other test user",
    online: true,
    roomIds: [testRoomId],
    username: "other_test_user",
  };
  const otherUserDocResult = {
    data: () => otherUserDocData,
  };

  const roomDocResult = {
    id: testRoomId,
  };

  const testTime = "test_time";
  // mock firebase.firestore.FieldValue.serverTimestamp for call in sendMessage
  firebase.firestore.FieldValue = {
    serverTimestamp: () => {
      return testTime;
    },
  };

  // message to mock sending, not for initial chat room messages render
  const testMessage = "MOCK_MESSAGE";
  const messageDocData = {
    message: testMessage,
    timestamp: testTime,
    username: user.username,
  };

  firestoreMock.get = jest
    .fn()
    // first call in getUsers, where there is only one other user
    .mockResolvedValueOnce([otherUserDocResult])
    // second call in getFirstRoom to get the current room
    .mockResolvedValueOnce([roomDocResult])
    // third call in getInitMessages, representing no initial messages
    .mockResolvedValueOnce([])
    // fourth call in checkUserInRoom, representing that current user is
    // in current room
    .mockResolvedValueOnce({ empty: false });
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );

  await waitFor(() => expect(firestoreMock.get).toBeCalledTimes(3));

  const messageInput = screen.getByPlaceholderText(
    "Potatoes can't talk... but you can!"
  );
  // Type out a message, then click send
  fireEvent.change(messageInput, { target: { value: testMessage } });
  await waitFor(() => screen.getByDisplayValue(testMessage));
  const button = screen.getByText("Send");
  fireEvent.click(button);
  await waitFor(() => expect(firestoreMock.get).toBeCalledTimes(4));
  await waitFor(() => expect(firestoreMock.update).toBeCalledTimes(1));
  expect(firestoreMock.update).toHaveBeenCalledWith({
    [user.username]: testTime,
  });
  await waitFor(() => expect(firestoreMock.add).toBeCalledTimes(1));
  expect(firestoreMock.add).toHaveBeenCalledWith(messageDocData);
  // Check that message form clears
  await waitFor(() => expect(messageInput.value).toBe(""));
});

test("Render chat room name", async () => {
  const testRoomId = "test_room_id";
  user.roomIds = [testRoomId];

  const otherUserDocData = {
    displayName: "Other test user",
    online: true,
    roomIds: [testRoomId],
    username: "other_test_user",
  };
  const otherUserDocResult = {
    data: () => otherUserDocData,
  };

  const roomDocResult = {
    id: testRoomId,
  };

  firestoreMock.get = jest
    .fn()
    // first call in getUsers, where there is only one other user
    .mockResolvedValueOnce([otherUserDocResult])
    // second call in getFirstRoom to get the current room
    .mockResolvedValueOnce([roomDocResult])
    // third call in getInitMessages, representing no initial messages
    .mockResolvedValueOnce([])
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );

  await waitFor(() =>
    screen.getByPlaceholderText("Potatoes can't talk... but you can!")
  );

  const chatRoomTitleElement = screen.getByTestId('room-name');
  expect(chatRoomTitleElement.children == otherUserDocData.displayName)
});

test("Render user list", async () => {
  // console.log("Starting test: Render user list");

  const docData1 = {
    displayName: "Test user1",
    online: true,
    roomIds: [],
    username: "test_user1",
  };
  const docData2 = {
    docs: [{ id: "room_id" }],
    displayName: "Test user2",
    online: true,
    roomIds: [],
    username: "test_user2",
  };
  const docResult1 = {
    data: () => docData1,
    id: "roomId",
  };
  const docResult2 = {
    data: () => docData2,
    id: "roomId",
  };

  firestoreMock.get = jest.fn(() => Promise.resolve([docResult1, docResult2]));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  expect(history.location.pathname).toEqual("/chatRoom");

  await waitFor(() =>
    screen.getByPlaceholderText("Potatoes can't talk... but you can!")
  );

  // first test user should appear once in user list and once as room name
  await waitFor(() => expect(screen.getAllByText(docData1.displayName).length == 2));
  await waitFor(() => expect(screen.getAllByText(docData2.displayName).length == 1));
});

test("Search user", async () => {
  // console.log("Starting test: Search user");

  const docData1 = {
    displayName: "Test user1",
    online: true,
    roomIds: [],
    username: "testuser1",
  };
  const docData2 = {
    displayName: "User2",
    online: true,
    roomIds: [],
    username: "user2",
  };
  const docResult1 = {
    data: () => docData1,
    id: "roomId",
  };
  const docResult2 = {
    data: () => docData2,
    id: "roomId",
  };

  firestoreMock.get = jest.fn(() => Promise.resolve([docResult1, docResult2]));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  expect(history.location.pathname).toEqual("/chatRoom");

  await waitFor(() => screen.getByPlaceholderText("Search"));
  // get all users
  // first test user should appear once in user list and once as room name
  await waitFor(() => expect(screen.getAllByText(docData1.displayName).length == 2));
  await waitFor(() => expect(screen.getAllByText(docData2.displayName).length == 1));

  // mock search user return
  firestoreMock.get = jest.fn(() => Promise.resolve([docResult1]));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const searchInput = screen.getByPlaceholderText("Search");
  fireEvent.input(searchInput, { target: { value: "test" } });

  await waitFor(() =>
    expect(screen.queryByText(docData2.displayName)).toBeNull()
  );
  // first test user should still appear twice, in user list and as room name
  expect(screen.getAllByText(docData1.displayName).length == 2)
});

test("Switch rooms", async () => {
  // console.log("Starting test: Switching Rooms");

  const message1 = "MOCK_MESSAGE_1";
  const message2 = "MOCK_MESSAGE_2";

  const roomIdForUsers1And2 = "test_room_id_users_1_and_2";
  const roomIdForUsers1And3 = "test_room_id_users_1_and_3";
  const roomIdForUsers2And3 = "test_room_id_users_2_and_3";

  user.roomIds = [roomIdForUsers1And2, roomIdForUsers1And3];

  const user2DocData = {
    displayName: "Test user 2",
    online: true,
    roomIds: [roomIdForUsers1And2, roomIdForUsers2And3],
    username: "test_user_2",
  };
  const user2DocResult = {
    data: () => user2DocData,
  };

  const user3DocData = {
    displayName: "Test user 3",
    online: true,
    roomIds: [roomIdForUsers1And3, roomIdForUsers2And3],
    username: "test_user_3",
  };
  const user3DocResult = {
    data: () => user3DocData,
  };

  const message1DocData = {
    message: message1,
    timestamp: 0,
    username: user.username,
  };
  const message1DocResult = {
    data: () => message1DocData,
  };

  const message2DocData = {
    message: message2,
    timestamp: 0,
    username: user.username,
  };
  const message2DocResult = {
    data: () => message2DocData,
  };

  const room1DocResult = {
    id: user.roomIds[0],
    messages: [message1DocResult],
  };

  const room2DocResult = {
    id: user.roomIds[1],
    messages: [message2DocResult],
  };

  firestoreMock.get = jest
    .fn()
    // first call in getUsers to get all existing users, where here it's just the
    // just test user 2 and 3
    .mockResolvedValueOnce([user2DocResult, user3DocResult])
    // second call in getFirstRoom to get a room
    .mockResolvedValueOnce([room1DocResult])
    // third call in getInitMessages, where there is only one message and it's
    // message1, by the current user
    .mockResolvedValueOnce(room1DocResult.messages);
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  expect(history.location.pathname).toEqual("/chatRoom");

  await waitFor(() =>
    screen.getByPlaceholderText("Potatoes can't talk... but you can!")
  );
  await waitFor(() => expect(firestoreMock.get).toBeCalledTimes(3));

  // get all users
  // user2 should appear once in user list and once as room name
  await waitFor(() => expect(screen.getAllByText(user2DocData.displayName).length == 2));
  await waitFor(() => expect(screen.getAllByText(user3DocData.displayName).length == 1));
  expect(screen.queryByText(user.displayName)).toBeNull();

  await waitFor(() => screen.getByText(message1));

  // mock switching rooms
  firestoreMock.get = jest
    .fn()
    // first call in checkChatRoomExists, representing retrieving the room that
    // contains test users 1 and 3
    .mockResolvedValueOnce([room2DocResult])
    // second call in getInitMessages, where there is only one message and it's
    // message2, by the current user
    .mockResolvedValueOnce(room2DocResult.messages);
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const user3Button = screen.getByText(user3DocData.displayName);
  fireEvent.click(user3Button);
  await waitFor(() => expect(firestoreMock.get).toBeCalledTimes(2));
  // now user2 should appear once but user3 should now appear in user list and room name
  await waitFor(() => expect(screen.getAllByText(user2DocData.displayName).length == 1));
  await waitFor(() => expect(screen.getAllByText(user3DocData.displayName).length == 2));
  await waitFor(() => expect(screen.queryByText(message1)).toBeNull());
  await waitFor(() => screen.getByText(message2));
});
