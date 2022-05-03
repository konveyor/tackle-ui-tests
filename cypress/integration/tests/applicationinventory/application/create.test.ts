/// <reference types="cypress" />

import {
    login,
    clickByText,
    inputText,
    submitForm,
    exists,
    notExists,
    hasToBeSkipped,
    preservecookies,
    selectUserPerspective,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import {
    applicationInventory,
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    duplicateErrMsg,
    createNewButton,
} from "../../../types/constants";
import {
    applicationDescriptionInput,
    applicationNameInput,
} from "../../../views/applicationinventory.view";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

import * as commonView from "../../../../integration/views/common.view";
import * as data from "../../../../utils/data_utils";

describe("Application validations", { tags: "@tier2" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        selectUserPerspective("Developer");
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Application field validations", function () {
        // Navigate to application inventory page and click "Create New" button
        clickByText(navMenu, applicationInventory);
        clickByText(button, createNewButton);

        // Name constraints
        inputText(applicationNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(applicationNameInput, data.getRandomWords(90));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);

        // Description constraint
        inputText(applicationDescriptionInput, data.getRandomWords(90));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);
        // Clear description field to make it valid input
        cy.get(applicationDescriptionInput).clear();

        // Validate the create button is enabled with valid inputs
        inputText(applicationNameInput, data.getFullName());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Application button validations", function () {
        // Navigate to application inventory page and click create new button
        clickByText(navMenu, applicationInventory);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new application
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" application inventory form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that application inventory page is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Application unique constraint validation", function () {
        const application = new ApplicationInventory(data.getFullName());

        // Create a new application
        application.create();
        cy.wait("@postApplication");
        exists(application.name);

        // Navigate to application inventory page and click create new button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(applicationNameInput, application.name);
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created application
        cy.get(commonView.closeButton).click();
        application.delete();
        cy.wait("@getApplication");
        notExists(application.name);
    });
});
