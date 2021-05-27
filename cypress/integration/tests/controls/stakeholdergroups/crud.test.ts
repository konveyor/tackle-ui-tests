/// <reference types="cypress" />

import { login, selectItemsPerPage, click, exists, notExists } from "../../../../utils/utils";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { expandRow } from "../../../views/common.view";

describe("Stakeholder group CRUD operations", () => {
    const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    it("Stakeholder group CRUD", function () {
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription()
        );
        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Edit stakeholder group's name
        var updateStakeholdergroupName = data.getCompanyName();
        stakeholdergroup.edit({ name: updateStakeholdergroupName });
        cy.wait("@getStakeholdergroups");

        // Assert that stakeholder group name got edited
        exists(updateStakeholdergroupName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        notExists(stakeholdergroup.name);
    });

    it("Stakeholder group CRUD with stakeholder member attached", function () {
        // Create stakeholder
        stakeholder.create();
        exists(stakeholder.email);
        var memberStakeholderName = stakeholder.name;

        // Create new object of stakeholder group with members
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            [memberStakeholderName]
        );

        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Check if stakeholder member is attached to stakeholder group
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

        // Edit the current stakeholder group's name, description and member
        stakeholdergroup.edit({
            name: data.getCompanyName(),
            description: data.getDescription(),
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
        notExists(stakeholdergroup.name);

        // Delete stakeholder
        stakeholder.delete();

        // Assert that created stakeholder is deleted
        notExists(stakeholder.email);
    });
});
