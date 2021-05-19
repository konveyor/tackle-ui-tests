/// <reference types="cypress" />

import { login, clickByText, inputText, submitForm } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    businessservices,
    button,
    nameUniqueWarning,
    nameLeastChars,
    nameMaxChars,
    descriptionMaxChars,
    createNewButton,
} from "../../../types/constants";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
} from "../../../views/businessservices.view";
import * as commonView from "../../../../integration/views/commoncontrols.view";

import { BusinessServices } from "../../../models/businessservices";
import * as faker from "faker";
import * as data from "../../../../utils/data_utils";

describe("Basic checks while creating business services", () => {
    beforeEach("Login", function () {
        // Perform login
        login();
    });

    it("Business services name and description contraints check", function () {
        // Navigate to "New stakeholder group" page
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        clickByText(button, createNewButton);
        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Name constraints
        inputText(businessServiceNameInput, "te");
        cy.get(commonView.nameHelper).should("contain", nameLeastChars);
        inputText(businessServiceNameInput, faker.random.words(50));
        cy.get(commonView.nameHelper).should("contain", nameMaxChars);
        inputText(businessServiceNameInput, "test");
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(businessServiceDescriptionInput, faker.random.words(120));
        cy.get(commonView.descriptionHelper).should("contain", descriptionMaxChars);
    });

    it("Cancel and close on business services creation", function () {
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

    it("Business services name must unique", function () {
        const businessServices = new BusinessServices(data.getStakeholderName());
        // Create business service
        businessServices.create();

        // Navigate to "New stakeholder group" page
        clickByText(button, createNewButton);

        // Check Name duplication
        inputText(businessServiceNameInput, businessServices.name);

        submitForm();

        cy.get(commonView.duplicateNameWarning).should("contain.text", nameUniqueWarning);

        // Delete created stakeholder group
        cy.get(commonView.closeButton).click();
        businessServices.delete();
    });
});
