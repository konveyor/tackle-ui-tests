/// <reference types="cypress" />

import {
    clickByText,
    exists,
    importApplication,
    login,
    openManageImportsPage,
} from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../models/businessservices";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, button } from "../../../types/constants";
import { actionButton } from "../../../views/applicationinventory.view";

const businessService = new BusinessServices("Finance and HR");
const filePath = "app_import/";
var applicationsList: Array<ApplicationInventory> = [];

describe("Application import operations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Create business service
        businessService.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Delete the business service
        businessService.delete();

        // Delete the applications
        if (applicationsList) {
            applicationsList.forEach(function (application) {
                application.delete();
            });
        }
    });

    it("Valid applications import", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import valid csv
        const fileName = "valid_application_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Import-app-1");
        exists("Import-app-2");

        // Create objects for imported apps
        for (let i = 1; i <= 2; i++) {
            const importedApp = new ApplicationInventory(`Import-app-${i}`);
            applicationsList.push(importedApp);
        }

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        cy.get("table > tbody > tr")
            .eq(0)
            .within(() => {
                cy.get("td[data-label='File name']").should("contain", fileName);
                cy.get("td[data-label='Status']").find("div").should("contain", "Completed");
                cy.get("td[data-label='Accepted']").should("contain", 2);
            });
    });

    it("Duplicate applications import", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import already imported valid csv file
        const fileName = "valid_application_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        cy.get("table > tbody > tr")
            .eq(0)
            .within(() => {
                cy.get("td[data-label='File name']").should("contain", fileName);
                cy.get("td[data-label='Status']").find("div").should("contain", "Completed");
                cy.get("td[data-label='Accepted']").should("contain", 0);
                cy.get("td[data-label='Rejected']").should("contain", 2);
                cy.get(actionButton).click();
                cy.get(button).contains("View error report").click();
            });

        // Verify the error report message
        cy.wait(2000);
        cy.get("h1").contains("Error report");
        cy.get("table > tbody > tr > td")
            .should("contain", "Duplicate ApplicationName in table: Import-app-1")
            .and("contain", "Duplicate ApplicationName in table: Import-app-2");
    });

    it("Applications import for non existing tags and business service", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import csv with non-existent businsess service and tag rows
        const fileName = "non_existing_tags_business_service_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        cy.get("table > tbody > tr")
            .eq(0)
            .within(() => {
                cy.get("td[data-label='File name']").should("contain", fileName);
                cy.get("td[data-label='Status']").find("div").should("contain", "Completed");
                cy.get("td[data-label='Accepted']").should("contain", 0);
                cy.get("td[data-label='Rejected']").should("contain", 2);
                cy.get(actionButton).click();
                cy.get(button).contains("View error report").click();
            });

        // Verify the error report message
        cy.wait(2000);
        cy.get("h1").contains("Error report");
        cy.get("table > tbody > tr > td")
            .should("contain", "Business Service: Finance does not exist")
            .and("contain", "Tag Type Database and Tag H2O combination does not exist");
    });
});
