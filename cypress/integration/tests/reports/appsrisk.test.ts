/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    clickByText,
    createMultipleStakeholders,
    createMultipleApplications,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    selectUserPerspective,
} from "../../../utils/utils";
import { verifyApplicationRisk } from "../../models/reports/reports";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import { navMenu } from "../../views/menu.view";
import { reports } from "../../types/constants";
import { Stakeholders } from "../../models/stakeholders";

var stakeholdersList: Array<Stakeholders> = [];
var applicationsList: Array<ApplicationInventory> = [];

describe("Application risks tests", { tags: "@newtest" }, () => {
    var risktype = ["low", "medium", "high"];

    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(3);
        for (let i = 0; i < applicationsList.length; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment(risktype[i], [stakeholdersList[0].name]);
            cy.wait(2000);
            applicationsList[i].is_assessed();

            // Perform application review
            applicationsList[i].perform_review(risktype[i]);
            cy.wait(2000);
            applicationsList[i].is_reviewed();
        }
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
        deleteApplicationTableRows();
    });

    it("Application risk validation", function () {
        // Navigate to reports page
        selectUserPerspective("Developer");
        clickByText(navMenu, reports);
        cy.wait(3000);

        for (let i = 0; i < 3; i++) {
            verifyApplicationRisk(risktype[i], applicationsList[i].name);
        }
    });
});
