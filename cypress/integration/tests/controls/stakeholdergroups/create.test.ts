/// <reference types="cypress" />

import "../../../../support/index";
import { stakeholdergroupTableRows } from "../../../views/stakeholdergroups.view";

const userName = Cypress.env("user");
const userPassword = Cypress.env("pass");
const tackleUiUrl = Cypress.env("tackleUrl");

var stakeholdergroup;

describe("Create New Stakeholder", () => {
    before("Login and load data", function () {
        // Get stakeholder group data object through random generator
        cy.task("stakeholdergroupData").then((object) => {
            stakeholdergroup = object;
        });

        // Perform login
        cy.login(userName, userPassword);

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroup");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdersgroup");
        cy.intercept("DELETE", "/api/controls/stakeholder-group/*").as("deleteStakeholdergroup");

        // Ensure Stakeholder groups page is opened
        cy.visit(tackleUiUrl + "/controls/stakeholder-groups");
        cy.wait(5000);

        cy.get("span.pf-c-tabs__item-text").should("contain", "Stakeholder groups");
    });

    it("Single stakeholder group with name and description", function () {
        cy.createStakeholdergroupMin(stakeholdergroup);

        // Wait untill stakeholder group create api is executed
        cy.wait("@postStakeholdergroup");

        //Select max(100) number of items to display from table per page
        cy.selectItemsPerPage(100);
        cy.wait("@getStakeholdersgroup");

        // Assert that newly created stakeholder group exists
        cy.get(stakeholdergroupTableRows)
            .get("td[data-label=Name]")
            .should("contain", stakeholdergroup.name);
        cy.get(stakeholdergroupTableRows)
            .get('td[data-label="Description"]')
            .should("contain", stakeholdergroup.description);
    });

    after("Delete stakeholder group", function () {
        cy.deleteStakeholdergroup(stakeholdergroup);
        cy.wait("@deleteStakeholdergroup");
    });
});
