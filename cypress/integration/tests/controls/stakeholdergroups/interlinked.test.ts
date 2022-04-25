/// <reference types="cypress" />

import {
    login,
    selectItemsPerPage,
    click,
    clickByText,
    exists,
    notExists,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholders, selectUserPerspective,
} from "../../../../utils/utils";
import { navTab } from "../../../views/menu.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag, stakeholderGroups } from "../../../types/constants";
import { expandRow } from "../../../views/common.view";
import * as data from "../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var membersList: Array<string> = [];

describe("Stakeholder group linked to stakeholder members", { tags: "@tier1" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Create two stakeholders
        stakeholdersList = createMultipleStakeholders(2);
        for (let i = 0; i < stakeholdersList.length; i++) {
            membersList.push(stakeholdersList[i].name);
        }
    });

    beforeEach("Login", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for stakeholder groups
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholdergroups");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("stakeholders attach, update and delete dependency on stakeholder group", function () {

        selectUserPerspective("Developer");

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
        clickByText(navTab, stakeholderGroups);

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
        clickByText(navTab, stakeholderGroups);

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
