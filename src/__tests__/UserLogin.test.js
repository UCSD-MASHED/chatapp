import { render, screen, fireEvent } from "@testing-library/react";
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

beforeEach(() => {
  firebase.auth.GoogleAuthProvider = jest.fn();
  firebase.auth().signInWithPopup = jest
    .fn()
    .mockImplementation(() => Promise.resolve(res));
  const history = createMemoryHistory();
  history.push("/createUser", { googleUser: user });
  render(
    <Router history={history}>
      <Login />
    </Router>
  );
  expect(history.location.pathname).toEqual("/createUser");
});

test("Login page elements", () => {
  const signIn = screen.getByText("Sign In With Google");
  expect(signIn).toBeInTheDocument();
  const button = screen.getByText("Sign In");
  expect(button).toBeInTheDocument();
});

test("Login with an existing user", async () => {
  const docData = { data: "MOCK_DATA" };
  const docResult = {
    data: () => docData,
  };
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve(docResult)),
    set: jest.fn().mockResolvedValue({ user: user }),
  };
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
  const button = screen.getByText("Sign In");
  fireEvent.click(button);

  expect(firebase.auth.GoogleAuthProvider).toBeCalledTimes(1);
  expect(firebase.auth().signInWithPopup).toBeCalledTimes(1);
  await expect(firebase.auth().signInWithPopup()).resolves.toEqual(res);
});

test("Login with an non-existing user", async () => {
  const docData = undefined;
  const docResult = {
    data: () => docData,
  };
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve(docResult)),
    set: jest.fn().mockResolvedValue({ user: user }),
  };
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
  const button = screen.getByText("Sign In");
  fireEvent.click(button);

  expect(firebase.auth.GoogleAuthProvider).toBeCalledTimes(1);
  expect(firebase.auth().signInWithPopup).toBeCalledTimes(1);
  await expect(firebase.auth().signInWithPopup()).resolves.toEqual(res);
});
