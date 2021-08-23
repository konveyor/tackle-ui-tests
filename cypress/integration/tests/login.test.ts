/// <reference types="cypress" />

import { login } from "../../utils/utils";

describe("Log In", () => {
    it("Login to Pathfinders", () => {
        // Login
        login();

        // Assert that home page has loaded after login
        cy.get("h1").should("contain", "Application inventory");
    });
});
