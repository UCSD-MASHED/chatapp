// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { attachCustomCommands } from "cypress-firebase";

const fbConfig = {
  apiKey: Cypress.env("APIKEY"),
  authDomain: Cypress.env("AUTHDOMAIN"),
  databaseURL: Cypress.env("DATABASEURL"),
  projectId: Cypress.env("PROJECTID"),
  storageBucket: Cypress.env("STORAGEBUCKET"),
  messagingSenderId: Cypress.env("MESSAGINGSENDERID"),
  appId: Cypress.env("APPID"),
};

firebase.initializeApp(fbConfig);

attachCustomCommands({ Cypress, cy, firebase });

// Run before ALL tests
before(() => {
  // createUser for our login test account
  cy.fixture("loginUser").then((loginUser) => {
    cy.callFirestore("set", `users/${Cypress.env("TEST_UID")}`, loginUser);
  });
});

after(() => {
  // delete user for login test account
  cy.callFirestore("delete", `users/${Cypress.env("TEST_UID")}`);
});
