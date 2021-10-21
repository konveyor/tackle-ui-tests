/// <reference types="cypress" />

import {
    login,
    clickByText,
    verifySortAsc,
    verifySortDesc,
    sortDesc,
    getTableColumnData,
    sortAsc,
    preservecookies,
    hasToBeSkipped,
    createMultipleApplications,
    createMultipleStakeholders,
    deleteAllStakeholders,
    deleteApplicationTableRows,
} from "../../../utils/utils";
import { navMenu } from "../../views/menu.view";
import {
    reports,
    applicationName,
    criticality,
    effort,
    priority,
    confidence,
} from "../../types/constants";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import { Stakeholders } from "../../models/stakeholders";

var applicationsList: Array<ApplicationInventory> = [];
var stakeholdersList: Array<Stakeholders> = [];

describe("Reports sort validations", { tags: "@tier2" }, () => {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(2);

        var risks = ["low", "medium", "high"];
        for (let i = 0; i < applicationsList.length; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment(risks[i], [stakeholdersList[0].name]);
            cy.wait(4000);
            applicationsList[i].is_assessed();
            cy.wait(4000);
            // Perform application review
            applicationsList[i].perform_review(risks[i]);
            cy.wait(4000);
            applicationsList[i].is_reviewed();
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete All
        deleteAllStakeholders();
        deleteApplicationTableRows();
    });

    it("Adoption candidate distribution - Application name sort validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(applicationName);

        // Sort the Adoption candidate distribution by application name in ascending order
        sortAsc(applicationName);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(applicationName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by application name in descending order
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

        // Sort the Adoption candidate distribution by criticality in ascending order
        sortAsc(criticality);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(criticality);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by criticality in descending order
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

        // Sort the Adoption candidate distribution by priority in ascending order
        sortAsc(priority);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(priority);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by priority in descending order
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

        // Sort the Adoption candidate distribution by confidence in ascending order
        sortAsc(confidence);
        cy.wait(2000);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(confidence);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by confidence in descending order
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

        // Sort the Adoption candidate distribution by effort in ascending order
        sortAsc(effort);
        cy.wait(2000);

        const afterAscSortList = getTableColumnData(effort);

        // List of efforts
        const itemsList = ["small", "medium", "large", "extra large"];

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        let prevAscIndex = 0;
        cy.wrap(afterAscSortList).each((value) => {
            let currentIndex = itemsList.indexOf(value.toString());
            expect(currentIndex >= prevAscIndex).to.be.true;
            prevAscIndex = currentIndex;
        });

        // Sort the Adoption candidate distribution by effort in descending order
        sortDesc(effort);
        cy.wait(2000);

        const afterDescSortList = getTableColumnData(effort);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        let prevDescIndex = itemsList.length - 1;
        cy.wrap(afterDescSortList).each((value) => {
            let currentIndex = itemsList.indexOf(value.toString());
            expect(currentIndex <= prevDescIndex).to.be.true;
            prevDescIndex = currentIndex;
        });
    });
});
