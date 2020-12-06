describe("The home page", () => {
  it("successfully loads", () => {
    cy.visit("/");
    cy.contains("Sign In");
  });
});

describe("Can create a new user", () => {
  before(() => {
    // delete user for login test account first
    cy.callFirestore("delete", `users/${Cypress.env("TEST_UID")}`);
  });

  after(() => {
    // createUser for our login test account
    // we want to do this so that tests after can run normally
    cy.fixture("loginUser").then((loginUser) => {
      cy.callFirestore("set", `users/${Cypress.env("TEST_UID")}`, loginUser);
    });
  });

  beforeEach(() => {
    cy.visit("/");
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it("should render chat room", () => {
    cy.contains("Please enter your username");
    return cy.fixture("loginUser").then((loginUser) => {
      cy.get("input").type(loginUser.username);
      cy.get("button").click();
      cy.contains("People");
    });
  });
});

describe("Can enter chat room after login", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login();
  });

  afterEach(() => {
    cy.logout();
  });

  it("should render chat room", () => {
    cy.contains("People");
  });
});

describe("Cannot enter chat room without login", () => {
  beforeEach(() => {
    cy.visit("/chatRoom");
  });

  it("should redirect back to login page", () => {
    cy.url().should("eq", Cypress.config().baseUrl + "/"); // back to login page
  });
});
