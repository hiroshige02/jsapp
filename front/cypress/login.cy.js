import { messages } from "@packages/shared";

before(() => {
  //   jest.clearAllMocks;
  //   app = testApp();
  cy.intercept("GET", "http://localhost:3333/api/check", {
    statusCode: 400,
    body: { message: messages.authFailed },
  }).as("getCheck");

  cy.intercept("GET", "http://localhost:3333/api/check_fido2_login", {
    statusCode: 200,
    body: { fido2: false },
  }).as("getCheckFido2Login");
});

describe("ログイン", () => {
  it("ログイン画面表示", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");

    cy.wait("@getCheck");
    cy.wait("@getCheckFido2Login");

    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
  });
});
