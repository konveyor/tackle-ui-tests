/// <reference types="cypress" />

import {
    login,
    clickByText,
    inputText,
    submitForm,
    exists,
    notExists,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    businessservices,
    button,
    duplicateErrMsg,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    createNewButton,
} from "../../../types/constants";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
} from "../../../views/businessservices.view";
import * as commonView from "../../../../integration/views/commoncontrols.view";

import { BusinessServices } from "../../../models/businessservices";
import * as data from "../../../../utils/data_utils";

describe("Business service validations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();
    });

    it("Business service field validations", function () {
        // Navigate to business service tab and click "Create New" button
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        clickByText(button, createNewButton);

        // Name constraints
        inputText(businessServiceNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(businessServiceNameInput, data.getRandomWords(45));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);
        inputText(businessServiceNameInput, data.getRandomWord(4));
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(businessServiceDescriptionInput, data.getRandomWords(75));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Business service button validations", function () {
        // Navigate to business service tab and click "Create New" button
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating business service
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" business service form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that business service tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Business service unique constraint validation", function () {
        const businessService = new BusinessServices(data.getCompanyName());
        // Create new business service
        businessService.create();
        exists(businessService.name);

        // Navigate to business service tab and click "Create New" button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(businessServiceNameInput, businessService.name);
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created business service
        cy.get(commonView.closeButton).click();
        businessService.delete();
        notExists(businessService.name);
    });
});
