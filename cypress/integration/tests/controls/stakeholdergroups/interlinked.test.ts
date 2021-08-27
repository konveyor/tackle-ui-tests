/// <reference types="cypress" />

import {
    login,
    selectItemsPerPage,
    click,
    clickByText,
    exists,
    notExists,
    preservecookies,
} from "../../../../utils/utils";
import { navTab } from "../../../views/menu.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag, stakeholdergroups } from "../../../types/constants";
import { expandRow } from "../../../views/common.view";
import * as data from "../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var membersList: Array<string> = [];

describe("Stakeholder group linked to stakeholder members", () => {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create two stakeholders
        for (let i = 0; i < 2; i++) {
            // Create new stakeholder
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);
            membersList.push(stakeholder.name);
        }
    });

    beforeEach("Login", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for stakeholder groups
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");

        // Interceptors for stakeholders
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    it("stakeholders attach, update and delete dependency on stakeholder group", function () {
        // Create new stakeholder group and attach two stakeholder members
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            membersList
        );
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Check if two stakeholder members attached to stakeholder group
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", membersList[0])
            .and("contain", membersList[1]);

        // Update name of second stakeholder
        var updatedStakeholderName = data.getFullName();
        stakeholdersList[1].edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");

        // Update name of stakeholder group
        var updatedStakeholdergroupName = data.getFullName();
        stakeholdergroup.edit({ name: updatedStakeholdergroupName });
        cy.wait("@getStakeholdergroups");

        // Go to stakeholder group page
        clickByText(navTab, stakeholdergroups);

        // Check if second stakeholder's name attached to stakeholder group updated
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", updatedStakeholderName);

        // Delete second stakeholder
        stakeholdersList[1].delete();
        cy.wait("@getStakeholders");
        // Assert that second stakeholder deleted
        notExists(stakeholdersList[1].name);

        // Go to stakeholder group page
        clickByText(navTab, stakeholdergroups);

        // Check if second stakeholder's name detached from stakeholder group
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("not.contain", updatedStakeholderName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that created stakeholder group is deleted
        notExists(stakeholdergroup.name);

        // Delete first stakeholder
        stakeholdersList[0].delete();
        cy.wait("@getStakeholders");
        // Assert that first stakeholder deleted
        notExists(stakeholdersList[0].name);
    });
});
