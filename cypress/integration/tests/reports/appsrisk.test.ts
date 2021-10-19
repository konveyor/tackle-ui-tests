/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    clickByText,
    createStakeholder,
} from "../../../utils/utils";
import { verifyApplicationRisk } from "../../models/reports/reports";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import { navMenu } from "../../views/menu.view";
import { reports } from "../../types/constants";
import * as data from "../../../utils/data_utils";
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

        stakeholdersList = createStakeholder(1);

        for (let i = 0; i < 3; i++) {
            // Navigate to application inventory tab and create new application
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription()
            );
            application.create();
            cy.wait(2000);
            applicationsList.push(application);

            // Perform assessment of application
            application.perform_assessment(risktype[i], [stakeholdersList[0].name]);
            cy.wait(2000);
            application.is_assessed();

            // Perform application review
            application.perform_review(risktype[i]);
            cy.wait(2000);
            application.is_reviewed();
        }
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Delete the stakeholders created before the tests
        if (stakeholdersList.length > 0) {
            stakeholdersList.forEach(function (stakeholder) {
                stakeholder.delete();
            });
        }

        if (applicationsList.length > 0) {
            applicationsList.forEach(function (application) {
                application.delete();
            });
        }
    });

    it("Application risk validation", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        for (let i = 0; i < 3; i++) {
            verifyApplicationRisk(risktype[i], applicationsList[i].name);
        }
    });
});
