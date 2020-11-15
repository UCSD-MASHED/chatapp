import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import CreateUser from "../modules/CreateUser";
import firebase from "firebase";

const user = {
  uid: "abcdefg",
  displayName: "test user",
};

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

  render(<CreateUser location={{ state: { googleUser: user } }} />);

  const usernameInput = screen.getByPlaceholderText("Enter your username");
  expect(usernameInput).toBeInTheDocument();
  fireEvent.input(usernameInput, "username123");
  const submit = screen.getByText("Submit");
  expect(submit).toBeInTheDocument();

  fireEvent.click(submit);
});
