/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    deleteAllStakeholders,
} from "../../../../utils/utils";

import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

import * as data from "../../../../utils/data_utils";
import { Stakeholders } from "../../../models/stakeholders";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersNameList: Array<string> = [];

describe("Application assessment and review tests", { tags: "@tier1" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier1")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
    });

    it("Application assessment and review with low risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            data.getDescription(),
            data.getDescription()
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("low", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("low");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Application assessment and review with medium risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            data.getDescription(),
            data.getDescription()
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("medium", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("medium");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Application assessment and review with high risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            data.getDescription(),
            data.getDescription()
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("high", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("high");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });
});
