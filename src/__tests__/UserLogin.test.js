import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../modules/Login";
import React from "react";
import firebase from "firebase/app";
import "../firebase";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

const user = {
  uid: "abcdefg",
  displayName: "test user",
};
const res = { user: user };

let firestoreMock;
let history;

beforeEach(() => {
  firebase.auth.GoogleAuthProvider = jest.fn();
  firebase.auth().signInWithPopup = jest
    .fn()
    .mockImplementation(() => Promise.resolve(res));
  history = createMemoryHistory();
  history.push("/");
  render(
    <Router history={history}>
      <Login />
    </Router>
  );
  expect(history.location.pathname).toEqual("/");

  firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: null,
    set: jest.fn().mockResolvedValue({ user: user }),
  };
});

test("Login page elements", () => {
  const button = screen.getByText("Sign In");
  expect(button).toBeInTheDocument();
});

test("Login with an existing user", async () => {
  const docData = { data: "MOCK_DATA" };
  const docResult = {
    data: () => docData,
  };
  firestoreMock.get = jest.fn(() => Promise.resolve(docResult));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
  const button = screen.getByText("Sign In");
  fireEvent.click(button);

  expect(firebase.auth.GoogleAuthProvider).toBeCalledTimes(1);
  expect(firebase.auth().signInWithPopup).toBeCalledTimes(1);
  await expect(firebase.auth().signInWithPopup()).resolves.toEqual(res);
  await waitFor(() => expect(history.location.pathname).toEqual("/chatRoom"));
});

test("Login with an non-existing user", async () => {
  const docData = undefined;
  const docResult = {
    data: () => docData,
  };
  firestoreMock.get = jest.fn(() => Promise.resolve(docResult));
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
  const button = screen.getByText("Sign In");
  fireEvent.click(button);

  expect(firebase.auth.GoogleAuthProvider).toBeCalledTimes(1);
  expect(firebase.auth().signInWithPopup).toBeCalledTimes(1);
  await expect(firebase.auth().signInWithPopup()).resolves.toEqual(res);
  await waitFor(() => expect(history.location.pathname).toEqual("/createUser"));
});
