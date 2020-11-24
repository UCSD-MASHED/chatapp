// import { render, screen, fireEvent } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import ChatRoom from "../modules/ChatRoom";

// import React from "react";
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
// const res = { user: user };

beforeEach(() => {
  const history = createMemoryHistory();
  history.push("/chatRoom", { user: user });
  expect(history.location.pathname).toEqual("/chatRoom");
});

test("Get messages and check if message is displayed on screen", async () => {
  // const docData = {
  //   message: "MOCK_MESSAGE",
  //   timestamp: 0,
  //   username: "test_user",
  // };
  // const docResult = {
  //   data: () => docData,
  // };

  // const firestoreMock = {
  //   collection: jest.fn().mockReturnThis(),
  //   doc: jest.fn().mockReturnThis(),
  //   orderBy: jest.fn().mockReturnThis(),
  //   get: jest.fn(() => Promise.resolve([docResult])),
  // };
  // jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  // const history = createMemoryHistory();
  // history.push("/chatRoom", { user: user });
  // expect(history.location.pathname).toEqual("/chatRoom");
  // render(
  //   <Router history={history}>
  //     <ChatRoom />
  //   </Router>
  // );
  // expect(history.location.pathname).toEqual("/chatRoom");

  // const usernameInput = screen.getByPlaceholderText(
  //   "Potatoes can't talk... but you can!"
  // );
  // expect(usernameInput).toBeInTheDocument();
  // const message = screen.getByText("MOCK_MESSAGE");
  // expect(message).toBeInTheDocument();
});

// test("Render user list", async () => {
//   const docData = [
//     {
//       displayName: "Test user1",
//       online: true,
//       roomIds: [],
//       username: "test_user1",
//     },
//     {
//       displayName: "Test user2",
//       online: true,
//       roomIds: [],
//       username: "test_user2",
//     }
//   ];
//   const docResult = {
//     data: () => docData,
//   };

//   const firestoreMock = {
//     collection: jest.fn().mockReturnThis(),
//     doc: jest.fn().mockReturnThis(),
//     orderBy: jest.fn().mockReturnThis(),
//     onSnapshot: jest.fn().mockReturnThis(),
//     get: jest.fn(() => Promise.resolve([docResult])),
//   };
//   jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

//   const history = createMemoryHistory();
//   history.push("/chatRoom", { user: user });
//   expect(history.location.pathname).toEqual("/chatRoom");
//   render(
//     <Router history={history}>
//       <ChatRoom />
//     </Router>
//   );
//   expect(history.location.pathname).toEqual("/chatRoom");

//   //TODO: check if the rendered user list has the right users
// });

test("Send message and check if message is populated into the database", async () => {});
