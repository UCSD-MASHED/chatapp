// import { render, screen, fireEvent } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import ChatRoom from "../modules/ChatRoom";
import ChatMessage from "../modules/ChatMessage";

// import React from "react";
import firebase from "firebase/app";
import "../firebase";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

import { mount } from "enzyme";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

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
  const docData = {
    message: "MOCK_MESSAGE",
    timestamp: 0,
    username: "test_user",
  };
  const docResult = {
    data: () => docData,
  };
  const props = [docResult];

  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve([docResult])),
  };
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const history = createMemoryHistory();
  history.push("/chatRoom", { user: user });
  expect(history.location.pathname).toEqual("/chatRoom");
  let wrapper = mount(
    <Router history={history}>
      <ChatRoom />
    </Router>
  );
  expect(history.location.pathname).toEqual("/chatRoom");

  console.log(wrapper.debug());
  expect(wrapper.find("input").props().placeholder).toEqual(
    "Potatoes can't talk... but you can!"
  );
  console.log(wrapper.state());

  // expect(wrapper.containsMatchingElement(<ChatMessage key={0} message={[docResult]} username={docData.username} />)).toEqual(true);

  // const message = screen.getByText("MOCK_MESSAGE");
  // expect(message).toBeInTheDocument();

  // const wrapper = shallow(<Chatroom />);
  // expect(wrapper.containsMatchingElement(<ChatMessage />)).toEqual(true);
});

test("Send message and check if message is populated into the database", async () => {
  const docData = {
    message: "MOCK_MESSAGE",
    timestamp: 0,
    username: "test_user",
  };
  const docResult = {
    data: () => docData,
  };

  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    set: jest.fn(() => Promise.resolve([docResult])),
    add: jest.fn(() => Promise.resolve([docResult])),
  };
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
});

test("Send message and check if message is populated into the database", async () => {});
