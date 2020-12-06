describe("Chat room user list and search", () => {
  let users;
  before(() => {
    // create test users
    cy.fixture("users").then((json) => {
      users = json;
      users.forEach((user) => {
        cy.callFirestore("set", `users/${user.uid}`, user);
      });
    });
  });

  after(() => {
    // delete test users
    users.forEach((user) => {
      cy.callFirestore("delete", `users/${user.uid}`);
    });
  });

  beforeEach(() => {
    cy.visit("/");
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it("Should render user list with our test users", () => {
    cy.contains("People");
    users.forEach((user) => {
      cy.contains(user.displayName);
      cy.contains(user.username);
    });
  });

  it("Search existing test users, both should show up", () => {
    cy.get(".user-list-wrapper input").type("testUserCypress");
    cy.contains("People");
    users.forEach((user) => {
      cy.contains(user.displayName);
      cy.contains(user.username);
    });
    cy.get(".list-group").find(".user").should("have.length", 2);
  });

  it("Search existing test user 1, which should show up", () => {
    cy.get(".user-list-wrapper input").type("testUserCypress1");
    cy.contains("People");
    let user1 = users[0];
    cy.contains(user1.displayName);
    cy.contains(user1.username);
    cy.get(".list-group").find(".user").should("have.length", 1);
  });

  it("Search non-existing user, which should not show up", () => {
    cy.get(".user-list-wrapper input").type("testUserCypress0");
    cy.contains("People");
    cy.get(".list-group").find(".user").should("have.length", 0);
  });
});
