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

  await waitFor(() =>
    screen.getByPlaceholderText("Potatoes can't talk... but you can!")
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

  const testTime = { seconds: 1606613537 }; // 11/28/2020, 5:32 PM
  const testMessage = "MOCK_MESSAGE";
  const messageDocData = {
    message: testMessage,
    timestamp: testTime,
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

  // check message is rendered
  await waitFor(() => screen.getByText(testMessage));
  // check timestamp is rendered
  await waitFor(() => screen.getByText("11/28, 5:32 PM"));
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
    .mockResolvedValueOnce([]);
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  render(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );

  await waitFor(() =>
    screen.getByPlaceholderText("Potatoes can't talk... but you can!")
  );

  expect(screen.getByTestId("room-name")).toHaveTextContent(
    otherUserDocData.displayName
  );
});

test("Render user list", async () => {
  const user1DocData = {
    displayName: "Test user1",
    online: true,
    roomIds: [],
    username: "test_user1",
  };
  const user1DocResult = {
    data: () => user1DocData,
  };

  const user2DocData = {
    displayName: "Test user2",
    online: true,
    roomIds: [],
    username: "test_user2",
  };
  const user2DocResult = {
    data: () => user2DocData,
  };

  firestoreMock.get = jest
    .fn()
    // first call in getUsers, where there are two other users
    .mockResolvedValueOnce([user1DocResult, user2DocResult])
    // second call in getFirstRoom, representing not having an open room with first user
    .mockResolvedValueOnce([]);
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

  // Each of the other test users should appear once in user list.
  // Note that the first user's name does not appear a second time
  // as the room name because the current user is not in a chat room.
  await waitFor(() =>
    expect(screen.getAllByText(user1DocData.displayName).length).toBe(1)
  );
  await waitFor(() =>
    expect(screen.getAllByText(user2DocData.displayName).length).toBe(1)
  );
  // current user's display name should not appear
  expect(screen.queryByText(user.displayName)).toBeNull();
});

test("Search user", async () => {
  const user1DocData = {
    displayName: "Test user1",
    online: true,
    roomIds: [],
    username: "test_user1",
  };
  const user1DocResult = {
    data: () => user1DocData,
  };

  const user2DocData = {
    displayName: "Test user2",
    online: true,
    roomIds: [],
    username: "test_user2",
  };
  const user2DocResult = {
    data: () => user2DocData,
  };

  firestoreMock.get = jest
    .fn()
    // first call in getUsers, where there are two other users
    .mockResolvedValueOnce([user1DocResult, user2DocResult])
    // second call in getFirstRoom, representing not having an open room with first user
    .mockResolvedValueOnce([]);
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

  // Each of the other test users should appear once in user list.
  // Note that the first user's name does not appear a second time
  // as the room name because the current user is not in a chat room.
  await waitFor(() =>
    expect(screen.getAllByText(user1DocData.displayName).length).toBe(1)
  );
  await waitFor(() =>
    expect(screen.getAllByText(user2DocData.displayName).length).toBe(1)
  );
  // current user's display name should not appear
  expect(screen.queryByText(user.displayName)).toBeNull();

  // mock search user return
  firestoreMock.get = jest.fn(() => Promise.resolve([user1DocResult]));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const searchInput = screen.getByPlaceholderText("Search");
  fireEvent.input(searchInput, { target: { value: "test" } });

  // first test user should still appear in user list, but second shouldn't
  await waitFor(() =>
    expect(screen.queryByText(user2DocData.displayName)).toBeNull()
  );
  expect(screen.getAllByText(user1DocData.displayName).length).toBe(1);
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
  await waitFor(() =>
    expect(screen.getAllByText(user2DocData.displayName).length).toBe(2)
  );
  await waitFor(() =>
    expect(screen.getAllByText(user3DocData.displayName).length).toBe(1)
  );
  expect(screen.queryByText(user.displayName)).toBeNull();

  await waitFor(() => screen.getByText(message1));

  // mock switching rooms

  // room has not been created yet. return new room created.
  firestoreMock.add = jest.fn().mockResolvedValueOnce(room2DocResult);

  // mock firebase.firestore.FieldValue.arrayUnion for call in setRoomId
  firebase.firestore.FieldValue = {
    arrayUnion: () => {
      return;
    },
  };

  firestoreMock.get = jest
    .fn()
    // first call in checkChatRoomExists, representing retrieving the room that
    // contains test users 1 and 3
    // users 1 and 3 do not have a room
    .mockResolvedValueOnce([])
    // second call in setRoomId
    .mockResolvedValueOnce([user, user3DocResult])
    // second call in getInitMessages, where there is only one message and it's
    // message2, by the current user
    .mockResolvedValueOnce(room2DocResult.messages);
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const user3Button = screen.getByText(user3DocData.displayName);
  fireEvent.click(user3Button);
  await waitFor(() => expect(firestoreMock.get).toBeCalledTimes(3));
  // now user2 should appear once but user3 should appear in user list and room name
  await waitFor(() =>
    expect(screen.getAllByText(user2DocData.displayName).length).toBe(1)
  );
  await waitFor(() =>
    expect(screen.getAllByText(user3DocData.displayName).length).toBe(2)
  );
  await waitFor(() => expect(screen.queryByText(message1)).toBeNull());
  await waitFor(() => screen.getByText(message2));
});
