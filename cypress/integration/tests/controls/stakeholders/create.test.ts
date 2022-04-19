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
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    stakeholders,
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    duplicateErrMsg,
    invalidEmailMsg,
    createNewButton,
} from "../../../types/constants";
import {
    stakeholderEmailInput,
    stakeholderNameInput,
    emailHelper,
    displayNameHelper,
} from "../../../views/stakeholders.view";
import { Stakeholders } from "../../../models/stakeholders";

import * as commonView from "../../../../integration/views/common.view";
import * as data from "../../../../utils/data_utils";

describe("Stakeholder validations", { tags: "@tier2" }, () => {
    const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("DELETE", "/hub/stakeholder*/*").as("deleteStakeholder");
    });

    it("Stakeholder field validations", function () {
        // Navigate to stakeholder tab and click "Create New" button
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        clickByText(button, createNewButton);

        // Email constraints
        inputText(stakeholderEmailInput, data.getRandomWord(2));
        cy.get(emailHelper).should("contain", minCharsMsg);
        inputText(stakeholderEmailInput, data.getRandomWords(45));
        cy.get(emailHelper).should("contain", max120CharsMsg);
        inputText(stakeholderEmailInput, data.getRandomWord(10));
        cy.get(emailHelper).should("contain", invalidEmailMsg);

        // Name constraints
        inputText(stakeholderNameInput, data.getRandomWord(2));
        cy.get(displayNameHelper).should("contain", minCharsMsg);
        inputText(stakeholderNameInput, data.getRandomWords(90));
        cy.get(displayNameHelper).should("contain", max250CharsMsg);

        // Validate the create button is enabled with valid inputs
        inputText(stakeholderEmailInput, data.getEmail());
        inputText(stakeholderNameInput, data.getFullName());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Stakholder button validations", function () {
        // Navigate to stakeholder tab and click create new button
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new stakeholder
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" stakeholder form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that stakholder tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Stakeholder unique constraint validation", function () {
        // Create a new stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Navigate to stakeholder tab and click create new button
        clickByText(button, createNewButton);

        // Check email duplication
        inputText(stakeholderEmailInput, stakeholder.email);
        inputText(stakeholderNameInput, data.getFullName());
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created stakeholder
        cy.get(commonView.closeButton).click();
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        notExists(stakeholder.email);
    });
});
