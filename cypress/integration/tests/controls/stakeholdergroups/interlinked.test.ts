/// <reference types="cypress" />

import { login, selectItemsPerPage, click, clickByText } from "../../../../utils/utils";
import { navTab } from "../../../views/menu.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag, stakeholders } from "../../../types/constants";
import { expandRow } from "../../../views/commoncontrols.view";
import * as faker from "faker";

describe("A single Stakeholder group linked to stakeholder member", () => {
    const stakeholdergroup = new Stakeholdergroups();
    const stakeholder = new Stakeholders();

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    it("Attach and edit stakeholder attached to Stakeholder group", function () {
        // Create stakeholder
        stakeholder.create();
        stakeholder.exists();
        var memberStakeholderName;
        memberStakeholderName = stakeholder.stakeholderName;

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

        // Edit stakeholder display name name
        stakeholder.edit({ name: faker.name.findName() });
        cy.wait("@getStakeholdergroups");

        // Go to stakeholder group page
        clickByText(navTab, stakeholders);

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
            .should("not.contain", stakeholder.stakeholderName);

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
