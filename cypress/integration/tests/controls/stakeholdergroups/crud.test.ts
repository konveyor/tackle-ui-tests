/// <reference types="cypress" />

import { login, selectItemsPerPage, click } from "../../../../utils/utils";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag } from "../../../types/constants";
import { expandRow } from "../../../views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

describe("Single Stakeholder group CRUD operations", () => {
    const stakeholder = new Stakeholders(data.getStakeholderEmail(), data.getStakeholderName());

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    it("Stakeholder group CRUD operations", function () {
        const stakeholdergroup = new Stakeholdergroups(
            data.getStakeholdergroupName(),
            data.getStakeholdergroupDescription()
        );
        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        stakeholdergroup.exists();

        // Edit stakeholder group's name
        var updateStakeholdergroupName = data.getStakeholdergroupName();
        stakeholdergroup.edit({ name: updateStakeholdergroupName });
        cy.wait("@getStakeholdergroups");

        // Assert that stakeholdergroup name got edited
        cy.get(tdTag).should("contain", updateStakeholdergroupName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        stakeholdergroup.notExists();
    });

    it("Stakeholder group CRUD with stakeholder member attached", function () {
        // Create stakeholder
        stakeholder.create();
        stakeholder.exists();
        var memberStakeholderName = stakeholder.name;
        // memberStakeholderName = stakeholder.stakeholderName;

        // Create new object of stakeholdergroup with members
        const stakeholdergroup = new Stakeholdergroups(
            data.getStakeholdergroupName(),
            data.getStakeholdergroupDescription(),
            [memberStakeholderName]
        );

        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        stakeholdergroup.exists();

        // Check if stakeholder member attached to stakeholder group
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", memberStakeholderName);

        // Edit stakeholder group with name, description and member
        stakeholdergroup.edit({
            name: data.getStakeholdergroupName(),
            description: data.getStakeholdergroupDescription(),
            members: [memberStakeholderName],
        });
        cy.wait("@getStakeholdergroups");

        // Check if stakeholder group's member is removed
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
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
        stakeholdergroup.notExists();

        // Delete stakeholder
        stakeholder.delete();

        // Assert that created stakeholder is deleted
        stakeholder.notExists();
    });
});
