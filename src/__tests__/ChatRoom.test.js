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
  history = createMemoryHistory();
  history.push("/chatRoom", { user: user });

  window.HTMLElement.prototype.scrollIntoView = function () { };
  firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: null,
    onSnapshot: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };
});

test("Get messages and check if message is displayed on screen", async () => {
  console.log("Starting test: Get message");

  const testRoomId = "test_room_id";
  user.roomIds = [testRoomId]
  const roomDocResult = {
    id: testRoomId
  }

  const userDocResult = {
    data: () => user
  };

  const otherUserDocData = {
    displayName: "Other test user",
    online: true,
    roomIds: [testRoomId],
    username: "other_test_user",
  };
  const otherUserDocResult = {
    data: () => otherUserDocData
  };

  const testMessage = "MOCK_MESSAGE";
  const messageDocData = {
    message: testMessage,
    timestamp: 0,
    username: user.username,
  };
  const messageDocResult = {
    data: () => messageDocData
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

  user.roomIds = [] // set back to empty for other tests
});

test("Send message and check if message is populated into the database", async () => { });

test("Render user list", async () => {
  console.log("Starting test: Render user list");

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

  await waitFor(() => screen.getByText(docData1.displayName));
  await waitFor(() => screen.getByText(docData2.displayName));
});

test("Search user", async () => {
  console.log("Starting test: Search user");

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
  await waitFor(() => screen.getByText(docData1.displayName));
  await waitFor(() => screen.getByText(docData2.displayName));

  // mock search user return
  firestoreMock.get = jest.fn(() => Promise.resolve([docResult1]));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const searchInput = screen.getByPlaceholderText("Search");
  fireEvent.input(searchInput, { target: { value: "test" } });

  await waitFor(() => screen.getByText(docData1.displayName));
  await waitFor(() =>
    expect(screen.queryByText(docData2.displayName)).toBeNull()
  );
});

test("Switch rooms", async () => {
  console.log("Starting test: Switching Rooms");
  const message1 = "MOCK_MESSAGE_1";
  const message2 = "MOCK_MESSAGE_2";

  const roomIdForUsers1And2 = "test_room_id_users_1_and_2";
  const roomIdForUsers1And3 = "test_room_id_users_1_and_3";
  const roomIdForUsers2And3 = "test_room_id_users_2_and_3";

  user.roomIds = [roomIdForUsers1And2, roomIdForUsers1And3]

  const userDocResult = {
    data: () => user
  };

  const user2DocData = {
    displayName: "Test user 2",
    online: true,
    roomIds: [roomIdForUsers1And2, roomIdForUsers2And3],
    username: "test_user_2",
  };
  const user2DocResult = {
    data: () => user2DocData
  };

  const user3DocData = {
    displayName: "Test user 3",
    online: true,
    roomIds: [roomIdForUsers1And3, roomIdForUsers2And3],
    username: "test_user_3",
  };
  const user3DocResult = {
    data: () => user3DocData
  };

  const message1DocData = {
    message: message1,
    timestamp: 0,
    username: user.username,
  };
  const message1DocResult = {
    data: () => message1DocData
  };

  const message2DocData = {
    message: message2,
    timestamp: 0,
    username: user.username,
  };
  const message2DocResult = {
    data: () => message2DocData
  };

  const room1DocResult = {
    id: user.roomIds[0],
    messages: [message1DocResult]
  }

  const room2DocResult = {
    id: user.roomIds[1],
    messages: [message2DocResult]
  }

  firestoreMock.get = jest
    .fn()
    // first call in getUsers to get all existing users, where here it's just the
    // current user and one other
    .mockResolvedValueOnce([user2DocResult, user3DocResult])
    // second call in getFirstRoom to get a room
    .mockResolvedValueOnce([room1DocResult])
    // third call in getInitMessages, where there is only one message and it's
    // message1, by the current user
    .mockResolvedValueOnce(room1DocResult.messages)
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
  await waitFor(() => screen.getByText(user2DocData.displayName));
  await waitFor(() => screen.getByText(user3DocData.displayName));
  expect(screen.queryByText(user.displayName)).toBeNull()

  await waitFor(() => screen.getByText(message1));

  // mock switching rooms
  firestoreMock.get = jest
    .fn()
    // first call in checkChatRoomExists, representing retrieving the room that
    // contains test users 1 and 3
    .mockResolvedValueOnce([room2DocResult])
    // second call in getInitMessages, where there is only one message and it's
    // message2, by the current user
    .mockResolvedValueOnce(room2DocResult.messages)
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const user3Button = screen.getByText(user3DocData.displayName);
  fireEvent.click(user3Button);
  await waitFor(() => expect(firestoreMock.get).toBeCalledTimes(2));
  await waitFor(() => expect(screen.queryByText(message1)).toBeNull());
  await waitFor(() => screen.getByText(message2));

  user.roomIds = [] // set back to empty for other tests
});