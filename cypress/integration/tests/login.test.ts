/// <reference types="cypress" />

import { login, selectUserPerspective } from "../../utils/utils";

describe("Log In", () => {
    it("Login to Pathfinder", { tags: "@tier1" }, () => {
        // Login
        login();
        selectUserPerspective("Developer");

        // Assert that home page has loaded after login
        cy.get("h1").should("contain", "Application inventory");
    });
});
