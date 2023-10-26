/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    login,
    clickByText,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    createMultipleApplications,
    createMultipleStakeholders,
    selectUserPerspective,
    clickOnSortButton,
    deleteByList,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import {
    reports,
    applicationName,
    criticality,
    effort,
    priority,
    confidence,
    migration,
    SortType,
    SEC,
} from "../../../types/constants";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
let applicationsList: Array<Assessment> = [];
let stakeholdersList: Array<Stakeholders> = [];

describe(["@tier2"], "Reports sort validations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(2);

        let risks = ["low", "medium", "high"];
        for (let i = 0; i < applicationsList.length; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment(risks[i], [stakeholdersList[0].name]);
            applicationsList[i].verifyStatus("assessment", "Completed");
            cy.wait(4 * SEC);
            // Perform application review
            applicationsList[i].perform_review(risks[i]);
            applicationsList[i].verifyStatus("review", "Completed");
        }
    });

    it("Bug MTA-1345: Adoption candidate distribution - Application name sort validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(applicationName);

        // Sort the Adoption candidate distribution by application name in ascending order
        clickOnSortButton(applicationName, SortType.ascending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(applicationName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by application name in descending order
        clickOnSortButton(applicationName, SortType.descending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(applicationName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Bug MTA-1345: Adoption candidate distribution - Criticality sort validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(criticality);

        // Sort the Adoption candidate distribution by criticality in ascending order
        clickOnSortButton(criticality, SortType.ascending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(criticality);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by criticality in descending order
        clickOnSortButton(criticality, SortType.descending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(criticality);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Bug MTA-1345: Adoption candidate distribution - Priority sort validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(priority);

        // Sort the Adoption candidate distribution by priority in ascending order
        clickOnSortButton(priority, SortType.ascending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(priority);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by priority in descending order
        clickOnSortButton(priority, SortType.descending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(priority);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Bug MTA-1345: Adoption candidate distribution - Confidence sort validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(confidence);

        // Sort the Adoption candidate distribution by confidence in ascending order
        clickOnSortButton(confidence, SortType.ascending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(confidence);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Adoption candidate distribution by confidence in descending order
        clickOnSortButton(confidence, SortType.descending);
        cy.wait(2 * SEC);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(confidence);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Bug MTA-1345: Adoption candidate distribution - Effort sort validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // Sort the Adoption candidate distribution by effort in ascending order
        clickOnSortButton(effort, SortType.ascending);
        cy.wait(2 * SEC);

        const afterAscSortList = getTableColumnData(effort);

        // List of efforts
        const itemsList = ["small", "medium", "large", "extra large"];

        // Verify that the Adoption candidate distribution table rows are displayed in ascending order
        let prevAscIndex = 0;
        cy.wrap(afterAscSortList).each((value) => {
            let currentIndex = itemsList.indexOf(value.toString());
            expect(currentIndex >= prevAscIndex).to.be.true;
        });

        // Sort the Adoption candidate distribution by effort in descending order
        clickOnSortButton(effort, SortType.descending);
        cy.wait(2 * SEC);

        const afterDescSortList = getTableColumnData(effort);

        // Verify that the Adoption candidate distribution table rows are displayed in descending order
        let prevDescIndex = itemsList.length - 1;
        cy.wrap(afterDescSortList).each((value) => {
            let currentIndex = itemsList.indexOf(value.toString());
            expect(currentIndex <= prevDescIndex).to.be.true;
        });
    });

    after("Perform test data clean up", function () {
        // Delete All
        deleteByList(stakeholdersList);
        deleteByList(applicationsList);
    });
});
