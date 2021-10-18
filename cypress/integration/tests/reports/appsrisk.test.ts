/// <reference types="cypress" />

import { hasToBeSkipped, login, preservecookies, clickByText } from "../../../utils/utils";
import { verifyApplicationRisk } from "../../models/reports/reports";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import { navMenu } from "../../views/menu.view";
import { reports } from "../../types/constants";
import * as data from "../../../utils/data_utils";
import { Stakeholders } from "../../models/stakeholders";

var stakeholdersList: Array<Stakeholders> = [];
var applicationsList: Array<ApplicationInventory> = [];
var stakeholdersNameList: Array<string> = [];

describe("Application assessment and review tests", { tags: "@newtest" }, () => {
    var risktype = ["low", "medium", "high"];

    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

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
            application.perform_assessment(risktype[i], stakeholdersNameList);
            cy.wait(2000);
            application.is_assessed();

            // Perform application review
            application.perform_review(risktype[i]);
            cy.wait(2000);
            application.is_reviewed();
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholders created before the tests
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        applicationsList.forEach(function (application) {
            application.delete();
        });
    });

    it("List applications by risk", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        for (let i = 0; i < 3; i++) {
            verifyApplicationRisk(risktype[i], applicationsList[i].name);
        }
    });
});
