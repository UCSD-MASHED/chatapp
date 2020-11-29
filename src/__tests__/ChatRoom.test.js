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
        where: jest.fn().mockReturnThis(),
    };
});

test("Get messages and check if message is displayed on screen", async () => {
    const docData = {
        docs: [{ id: "room_id" }],
        message: "MOCK_MESSAGE",
        timestamp: 0,
        username: "test_user",
    };
    const docResult = {
        data: () => docData,
        id: "roomId",
    };
    firestoreMock.get = jest.fn(() => Promise.resolve([docResult]));
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

    const message = screen.getByText("MOCK_MESSAGE");
    expect(message).toBeInTheDocument();
});

test("Send message and check if message is populated into the database", async () => { });

test("Render user list", async () => {
    const docData1 = {
        docs: [{ id: "room_id" }],
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
    const docData1 = {
        docs: [{ id: "room_id" }],
        displayName: "Test user1",
        online: true,
        roomIds: [],
        username: "testuser1",
    };
    const docData2 = {
        docs: [{ id: "room_id" }],
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
    const message1 = "MOCK_MESSAGE_1";
    const message2 = "MOCK_MESSAGE_2";

    const docData1 = {
        docs: [{ "id": "room_id" }],
        displayName: "Test user1",
        online: true,
        roomIds: [],
        username: "testuser1",
        message: "MOCK_MESSAGE_1",
    };
    const docData2 = {
        docs: [{ "id": "room_id" }],
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
    await waitFor(() =>
        screen.getByPlaceholderText("Potatoes can't talk... but you can!")
    );

    // verify messages are from user1
    await waitFor(() => screen.getByText(docData1.message));
    await waitFor(() =>
        expect(screen.queryByText(message2)).toBeNull()
    );

    // mock switching rooms
    docData1.message = null;
    docData2.message = message2;
    firestoreMock.get = jest.fn(() => Promise.resolve([docResult1, docResult2])); // 2 -> 1
    jest.spyOn(firebase, "firestore").mockImplementation(() => firestoreMock);

    const user2 = screen.getByText(docData2.displayName);
    fireEvent.click(user2);

    await waitFor(() => screen.getByText(docData1.displayName));
    await waitFor(() => screen.getByText(docData2.displayName));
    await waitFor(() =>
        screen.getByPlaceholderText("Potatoes can't talk... but you can!")
    );

    // verify messages are from user2
    await waitFor(() => screen.getByText(docData2.message));
    await waitFor(() =>
        expect(screen.queryByText(message1)).toBeNull()
    );
});

