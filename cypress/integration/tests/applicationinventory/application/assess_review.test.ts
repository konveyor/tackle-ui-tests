/// <reference types="cypress" />

import { login } from "../../../../utils/utils";

import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

import * as data from "../../../../utils/data_utils";
import { Stakeholders } from "../../../models/stakeholders";

describe("Application assessment and review tests", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/application-inventory/application*").as("postApplication");
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    it("Assessment and review of application", function () {
        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        var stakeholdersList: Array<string> = [];
        stakeholdersList.push(stakeholder.name);

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
        application.perform_assessment("low", stakeholdersList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("low");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();

        // Delete stakeholder
        stakeholder.delete();
    });
});
