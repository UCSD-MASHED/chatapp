describe("The Home Page", () => {
  it("successfully loads", () => {
    cy.visit("/");
    cy.contains("Sign In");
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
