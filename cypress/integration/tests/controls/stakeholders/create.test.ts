/// <reference types="cypress" />

import { login, clickByText, inputText, submitForm } from "../../../../utils/utils";
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
    displayNameHelper
} from "../../../views/stakeholders.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";

import * as commonView from "../../../../integration/views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

describe("Basic checks while creating stakeholder", () => {
    const stakeholder = new Stakeholders(data.getStakeholderEmail(), data.getStakeholderName());

    beforeEach("Login", function () {
        // Perform login
        login();
    });

    it("Stakeholder name and email constraints check", function () {
        // Navigate to stakeholder tab and click create new button
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

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
        inputText(stakeholderEmailInput, data.getStakeholderEmail());
        inputText(stakeholderNameInput, data.getStakeholderName());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Cancel and close form for stakholder creation", function () {
        // Navigate to stakeholder tab and click create new button
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        clickByText(button, createNewButton);

        // Cancel creating new stakeholder
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close create stakeholder form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that stakholder tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Stakeholder unique constraint check", function () {
        // Create a new stakeholder
        stakeholder.create();

        // Navigate to stakeholder tab and click create new button
        clickByText(button, createNewButton);

        // Check email duplication
        inputText(stakeholderEmailInput, stakeholder.email);
        inputText(stakeholderNameInput, data.getStakeholderName());
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created stakeholder
        cy.get(commonView.closeButton).click();
        stakeholder.delete();
    });
});
