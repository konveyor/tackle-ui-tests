/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { tdTag } from "../../../types/constants";

describe("A single Stakeholder group", () => {
    const stakeholdergroup = new Stakeholdergroups();

    before("Login", function () {
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
        cy.get(tdTag).should("not.contain", stakeholdergroup.stakeholdergroupName);
    });
});
