/// <reference types="cypress" />

import { login, clickByText, inputText, submitForm } from "../../../../utils/utils";
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
        // Navigate to "New stakeholder group" page
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        clickByText(button, createNewButton);
        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Name constraints
        inputText(businessServiceNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(businessServiceNameInput, data.getRandomWords(45));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);
        inputText(businessServiceNameInput, "test");
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(businessServiceDescriptionInput, data.getRandomWords(75));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);
    });

    it("Business service button validations", function () {
        // Navigate to "New stakeholder group" page
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        clickByText(button, createNewButton);
        // Cancel creating stakeholder group
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close create stakeholder group page
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Asserting stakholder groups page
        cy.contains(button, createNewButton).should("exist");
    });

    it("Business service unique name validation", function () {
        const businessServices = new BusinessServices(data.getCompanyName());
        // Create business service
        businessServices.create();

        // Navigate to "New stakeholder group" page
        clickByText(button, createNewButton);

        // Check Name duplication
        inputText(businessServiceNameInput, businessServices.name);

        submitForm();

        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created stakeholder group
        cy.get(commonView.closeButton).click();
        businessServices.delete();
    });
});
