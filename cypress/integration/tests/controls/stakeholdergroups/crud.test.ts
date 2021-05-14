/// <reference types="cypress" />

import { login, selectItemsPerPage, click } from "../../../../utils/utils";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag } from "../../../types/constants";
import { expandRow } from "../../../views/commoncontrols.view";
import * as faker from "faker";

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
        stakeholdergroup.exists();

        // Edit stakeholder group's name
        stakeholdergroup.edit({ name: faker.company.companyName() });
        cy.wait("@getStakeholdergroups");

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        stakeholdergroup.notExists();
    });

    it("Stakeholder group CRUD with Stakeholder Member attached", function () {
        // Create stakeholder
        stakeholders.create();
        stakeholders.exists();
        var memberStakeholderName;
        memberStakeholderName = stakeholders.stakeholderName;

        // Create new stakeholder group
        stakeholdergroup.create({ member: memberStakeholderName });
        cy.wait("@postStakeholdergroups");
        stakeholdergroup.exists();

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
        stakeholdergroup.edit({ member: memberStakeholderName });
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
        stakeholdergroup.notExists();
        // Delete stakeholder
        stakeholders.delete();

        // Assert that created stakeholder is deleted
        stakeholders.notExists();
    });
});
