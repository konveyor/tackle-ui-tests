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
    preservecookies,
    deleteApplicationTableRows,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleApplications,
    deleteAllStakeholders,
} from "../../../../../../utils/utils";
import {
    copyAssessmentTableTr,
    copyAssessmentPagination,
} from "../../../../../views/applicationinventory.view";
import * as commonView from "../../../../../views/common.view";
import { Stakeholders } from "../../../../../models/migration/controls/stakeholders";
import { Assessment } from "../../../../../models/migration/applicationinventory/assessment";

var stakeholdersList: Array<Stakeholders> = [];
var applicationList: Array<Assessment> = [];

describe(["@tier2"], "Assessment pagination validations", function () {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Navigate to Application inventory tab, delete all and create 11 applications
        deleteApplicationTableRows();

        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        applicationList = createMultipleApplications(11);

        // Perform assessment of application
        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        applicationList[0].verifyStatus("assessment", "Completed");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholders created before the tests
        deleteAllStakeholders();

        // Delete the applications created at the start of test
        deleteApplicationTableRows();
    });

    it("Navigation button validations", function () {
        // Navigate to Application assessment copy dialogue
        applicationList[0].openCopyAssessmentModel();
        cy.wait(2000);

        // select 10 items per page
        applicationList[0].selectItemsPerPage(10);
        cy.wait(2000);

        // Verify next buttons are enabled as there are more than 10 rows present
        cy.get(copyAssessmentPagination)
            .find(commonView.nextPageButton)
            .each(($nextBtn) => {
                cy.wrap($nextBtn).should("not.be.disabled");
            });

        // Verify that previous buttons are disabled being on the first page
        cy.get(copyAssessmentPagination)
            .find(commonView.prevPageButton)
            .each(($previousBtn) => {
                cy.wrap($previousBtn).should("be.disabled");
            });

        // Navigate to next page
        cy.get(copyAssessmentPagination).find(commonView.nextPageButton).click();
        cy.wait(2000);

        // Verify that previous buttons are enabled after moving to next page
        cy.get(copyAssessmentPagination)
            .find(commonView.prevPageButton)
            .each(($previousBtn) => {
                cy.wrap($previousBtn).should("not.be.disabled");
            });
    });

    it("Items per page validations", function () {
        // Navigate to Application assessment copy dialogue
        applicationList[0].openCopyAssessmentModel();
        cy.wait(2000);

        // Select 10 items per page
        applicationList[0].selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get(copyAssessmentTableTr)
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });

        // Select 20 items per page
        applicationList[0].selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get(copyAssessmentTableTr)
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
            });
    });
});
