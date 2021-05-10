/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag } from "../../../types/constants";

describe("A single Stakeholder group", () => {
    const stakeholdergroup = new Stakeholdergroups();
    const stakeholders = new Stakeholders();

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    it("Stakeholder group crud operations", function () {
        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");

        // Edit stakeholder group's name and description
        stakeholdergroup.edit();
        cy.wait("@getStakeholdergroups");

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        cy.get(tdTag).should("not.contain", stakeholdergroup.getCurrentstakeholdergroupName);
    });

    it("Stakeholder group CRUD with Stakeholder Member attached", function () {
        // Create stakeholder
        stakeholders.create();
        var stakeholderName;
        stakeholderName = stakeholders.getCurrentStakeholderName();
        // Create new stakeholder group
        stakeholdergroup.create(stakeholderName);
        cy.wait("@postStakeholdergroups");
        // Check if stakeholder member attached to stakeholder group
        cy.get(tdTag).should("contain", "1");

        // Edit stakeholder group with name, description and member
        stakeholdergroup.edit(stakeholderName);
        cy.wait("@getStakeholdergroups");
        // Check if stakeholder group's member count is updated
        cy.get(tdTag).should("contain", "0");

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        cy.get(tdTag).should("not.contain", stakeholdergroup.getCurrentstakeholdergroupName);

        // Delete stakeholder
        stakeholders.delete();
        // Assert that newly created stakeholder is deleted
        cy.get(tdTag).should("not.contain", stakeholderName);
    });
});
