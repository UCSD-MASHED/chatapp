import { render, screen, fireEvent } from "@testing-library/react";
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

test("Try to go to create user without logging in", async () => {
  const history = createMemoryHistory();
  history.push("/createUser");
  render(
    <Router history={history}>
      <CreateUser />
    </Router>
  );
  // it will go back to sign in page
  expect(history.location.pathname).toEqual("/");
});

test("Create User", async () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true }),
    set: jest.fn().mockResolvedValue({ user: user }),
  };
  jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

  const history = createMemoryHistory();
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
});
