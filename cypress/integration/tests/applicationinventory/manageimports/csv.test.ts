/// <reference types="cypress" />

import {
    login,
    openManageImportsPage,
    preservecookies,
    hasToBeSkipped,
} from "../../../../utils/utils";
import { actionButton } from "../../../views/applicationinventory.view";

describe("Manage imports tests", { tags: "@newtest" }, function () {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Go to application import page
        openManageImportsPage();
    });

    it("Download CSV template", function () {
        // Open action dropdown
        cy.get(actionButton).eq(1).click();
        // Click on option - Download CSV template
        cy.get("a.pf-c-dropdown__menu-item").contains("Download CSV template").click();
        // Check if file contains appropriate data
        cy.readFile("cypress/downloads/sample_application_import.csv").should(
            "contain",
            "My application1"
        );
    });
});
