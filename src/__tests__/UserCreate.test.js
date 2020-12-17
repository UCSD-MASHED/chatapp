import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import CreateUser from "../modules/CreateUser";
import firebase from "firebase/app";
import "../firebase";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

const user = {
  uid: "abcdefg",
  displayName: "test user",
};

let history;
let firestoreMock;

beforeEach(() => {
  history = createMemoryHistory();

  // mocks usernameIsUnique
  firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true }),
    set: jest.fn().mockResolvedValue({ user: user }),
  };
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);
});

test("Try to go to create user without logging in", async () => {
  history.push("/createUser");
  render(
    <Router history={history}>
      <CreateUser />
    </Router>
  );
  // it will go back to sign in page
  expect(history.location.pathname).toEqual("/");
});

test("Create User with valid username", async () => {
  history.push("/createUser", { googleUser: user });
  render(
    <Router history={history}>
      <CreateUser />
    </Router>
  );
  // it stays at create user page
  expect(history.location.pathname).toEqual("/createUser");

  const usernameInput = screen.getByPlaceholderText("Enter your username");
  expect(usernameInput).toBeInTheDocument();
  fireEvent.input(usernameInput, { target: { value: "username123" } });
  const inputVal = screen.getByDisplayValue("username123");
  expect(inputVal).toBeInTheDocument();
  const submit = screen.getByText("Submit");
  expect(submit).toBeInTheDocument();

  fireEvent.click(submit);
  // should go to chat room
  await waitFor(() => expect(history.location.pathname).toEqual("/chatRoom"));
});

test("Create User with invalid username", async () => {
  history.push("/createUser", { googleUser: user });
  render(
    <Router history={history}>
      <CreateUser />
    </Router>
  );
  // it stays at create user page
  expect(history.location.pathname).toEqual("/createUser");

  const usernameInput = screen.getByPlaceholderText("Enter your username");
  expect(usernameInput).toBeInTheDocument();
  fireEvent.input(usernameInput, { target: { value: "@" } });
  const inputVal = screen.getByDisplayValue("@");
  expect(inputVal).toBeInTheDocument();
  const submit = screen.getByText("Submit");
  expect(submit).toBeInTheDocument();

  fireEvent.click(submit);
  // should remain at the same page
  await waitFor(() => expect(history.location.pathname).toEqual("/createUser"));
});
