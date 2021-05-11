/// <reference types="cypress" />

import { login, selectItemsPerPage, click } from "../../../../utils/utils";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag } from "../../../types/constants";
import { expandRow } from "../../../views/commoncontrols.view";

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
        var newStakeholdergroupName = stakeholdergroup.getNewStakeholdergroupName();
        stakeholdergroup.edit(newStakeholdergroupName);
        cy.wait("@getStakeholdergroups");

        // Delete stakeholder group
        stakeholdergroup.delete(newStakeholdergroupName);
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        cy.get(tdTag).should("not.contain", newStakeholdergroupName);
    });

    it("Stakeholder group CRUD with Stakeholder Member attached", function () {
        // Create stakeholder
        stakeholders.create();
        var memberStakeholderName;
        memberStakeholderName = stakeholders.stakeholderName;

        // Create new stakeholder group
        stakeholdergroup.create(null, null, memberStakeholderName);
        cy.wait("@postStakeholdergroups");

        // Check if stakeholder member attached to stakeholder group
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", memberStakeholderName);

        // Edit stakeholder group with name, description and member
        stakeholdergroup.edit(null, null, memberStakeholderName);
        cy.wait("@getStakeholdergroups");

        // Check if stakeholder group's member is removed
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("not.contain", memberStakeholderName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        cy.get(tdTag).should("not.contain", stakeholdergroup.stakeholdergroupName);

        // Delete stakeholder
        stakeholders.delete();

        // Assert that created stakeholder is deleted
        cy.get(tdTag).should("not.contain", memberStakeholderName);
    });
});
