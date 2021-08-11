/// <reference types="cypress" />

import {
    login,
    clickByText,
    verifySortAsc,
    verifySortDesc,
    sortDesc,
    getTableColumnData,
    sortAsc,
} from "../../../utils/utils";
import { navMenu } from "../../views/menu.view";
import {
    reports,
    applicationinventory,
    applicationName,
    criticality,
    effort,
    priority,
    confidence,
} from "../../types/constants";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import * as data from "../../../utils/data_utils";
import { Stakeholders } from "../../models/stakeholders";

var applicationsList: Array<ApplicationInventory> = [];
var stakeholdersList: Array<Stakeholders> = [];

describe("Reports sort validations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        stakeholdersList.push(stakeholder);

        var risks = ["low", "medium", "high"];
        for (let i = 0; i < 2; i++) {
            const newApplication = new ApplicationInventory(data.getFullName());
            newApplication.create();
            applicationsList.push(newApplication);

            // Perform assessment of application
            newApplication.perform_assessment(risks[i], [stakeholder.name]);
            cy.wait(4000);
            newApplication.is_assessed();
            cy.wait(4000);
            // Perform application review
            newApplication.perform_review(risks[i]);
            cy.wait(4000);
            newApplication.is_reviewed();
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        // Delete the Applications created before the tests
        clickByText(navMenu, applicationinventory);
        cy.wait(3000);
        applicationsList.forEach(function (application) {
            cy.get(".pf-c-table > tbody > tr")
                .not(".pf-c-table__expandable-row")
                .find("td[data-label=Name]")
                .each(($rows) => {
                    if ($rows.text() === application.name) application.delete();
                });
        });
    });

    it("Adoption candidate distribution - Application name sort validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(applicationName);

        // Sort the Adoption candidate distribution by name in ascending order
        sortAsc(applicationName);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(applicationName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by name in descending order
        sortDesc(applicationName);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(applicationName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Adoption candidate distribution - Criticality sort validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(criticality);

        // Sort the Adoption candidate distribution by name in ascending order
        sortAsc(criticality);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(criticality);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by name in descending order
        sortDesc(criticality);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(criticality);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Adoption candidate distribution - Priority sort validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(priority);

        // Sort the Adoption candidate distribution by name in ascending order
        sortAsc(priority);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(priority);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by name in descending order
        sortDesc(priority);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(priority);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Adoption candidate distribution - Confidence sort validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(confidence);

        // Sort the Adoption candidate distribution by name in ascending order
        sortAsc(confidence);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(confidence);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by name in descending order
        sortDesc(confidence);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(confidence);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Adoption candidate distribution - Effort sort validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Sort the Adoption candidate distribution by name in ascending order
        sortAsc(effort);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(effort);

        // List of efforts
        const itemsList = ["small", "medium", "large", "extra large"];

        let prevAscIndex = 0;
        cy.wrap(afterAscSortList).each((value) => {
            let currentIndex = itemsList.indexOf(value.toString());
            expect(currentIndex >= prevAscIndex).to.be.true;
            prevAscIndex = currentIndex;
        });

        // Sort the Adoption candidate distribution by name in descending order
        sortDesc(effort);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(effort);

        let prevDescIndex = itemsList.length - 1;
        cy.wrap(afterDescSortList).each((value) => {
            let currentIndex = itemsList.indexOf(value.toString());
            expect(currentIndex <= prevDescIndex).to.be.true;
            prevDescIndex = currentIndex;
        });
    });
});
