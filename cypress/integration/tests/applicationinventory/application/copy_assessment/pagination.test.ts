/// <reference types="cypress" />

import {
    login,
    preservecookies,
    deleteApplicationTableRows,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleApplications,
    deleteAllStakeholders,
} from "../../../../../utils/utils";
import { ApplicationInventory } from "../../../../models/applicationinventory/applicationinventory";
import { copyAssessmentTableTr } from "../../../../views/applicationinventory.view";
import * as commonView from "../../../../views/common.view";
import { Stakeholders } from "../../../../models/stakeholders";

var stakeholdersList: Array<Stakeholders> = [];
var applicationList: Array<ApplicationInventory> = [];

describe("Assessment pagination validations", { tags: "@newtest" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

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
        cy.wait(2000);
        applicationList[0].is_assessed();
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@newtest")) return;

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
        cy.get(".pf-m-compact")
            .eq(1)
            .find(commonView.nextPageButton)
            .each(($nextBtn) => {
                cy.wrap($nextBtn).should("not.be.disabled");
            });

        // Verify that previous buttons are disabled being on the first page
        cy.get(".pf-m-compact")
            .eq(1)
            .find(commonView.prevPageButton)
            .each(($previousBtn) => {
                cy.wrap($previousBtn).should("be.disabled");
            });

        // Navigate to next page
        cy.get(".pf-m-compact").eq(1).find(commonView.nextPageButton).click();
        cy.wait(2000);

        // Verify that previous buttons are enabled after moving to next page
        cy.get(".pf-m-compact")
            .eq(1)
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
