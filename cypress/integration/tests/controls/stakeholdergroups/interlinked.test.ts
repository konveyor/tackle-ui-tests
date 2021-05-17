/// <reference types="cypress" />

import {
    login,
    selectItemsPerPage,
    click,
    clickByText,
    exists,
    notExists,
} from "../../../../utils/utils";
import { navTab } from "../../../views/menu.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, trTag, stakeholdergroups } from "../../../types/constants";
import { expandRow } from "../../../views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

describe("Single Stakeholder group linked to a stakeholder member", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors for stakeholder groups
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");

        // Interceptors for stakeholders
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    it("Attach and edit stakeholder attached to Stakeholder group", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

        // Create stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.name);

        var memberStakeholderName = stakeholder.name;
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            [memberStakeholderName]
        );
        // Create stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

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

        // Edit stakeholder display name
        var updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");

        // Go to stakeholder group page
        clickByText(navTab, stakeholdergroups);

        // Check if stakeholder group's member name updated
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", updatedStakeholderName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that created stakeholder group is deleted
        notExists(stakeholdergroup.name);

        // Delete stakeholder
        stakeholder.delete();

        // Assert that created stakeholder is deleted
        notExists(stakeholder.name);
    });
});
