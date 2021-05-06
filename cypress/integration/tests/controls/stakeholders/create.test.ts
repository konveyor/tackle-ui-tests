/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag } from "../../../types/constants";

describe("Create New Stakeholder", () => {
    const stakeholder = new Stakeholders();

    before("Login", function() {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    it("Stakeholder crud operations", function() {

        // Create new stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");

        // Edit stakeholder"s name
        stakeholder.edit();
        cy.wait("@getStakeholders");

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        cy.get(tdTag).should("not.contain", stakeholder.stakeholderEmail);
    });
});
