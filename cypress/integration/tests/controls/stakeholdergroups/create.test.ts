/// <reference types="cypress" />

import { login, clickByText, inputText, submitForm } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    stakeholdergroups,
    button,
    duplicateErrMsg,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    createNewButton,
} from "../../../types/constants";
import {
    stakeholdergroupNameInput,
    stakeholdergroupDescriptionInput,
} from "../../../views/stakeholdergroups.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import * as commonView from "../../../../integration/views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

describe("Stakeholder groups validations", () => {
    const stakeholdergroup = new Stakeholdergroups(data.getCompanyName(), data.getSentence());

    beforeEach("Login", function () {
        // Perform login
        login();
    });

    it("Stakeholder group field validations", function () {
        // Navigate to "New stakeholder group" page
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        clickByText(button, createNewButton);
        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Name constraints
        inputText(stakeholdergroupNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(stakeholdergroupNameInput, data.getRandomWords(50));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);
        inputText(stakeholdergroupNameInput, data.getRandomWord(4));
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(stakeholdergroupDescriptionInput, data.getRandomWords(120));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);
    });

    it("Stakholder group button validations", function () {
        // Navigate to "New stakeholder group" page
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
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

    it("Stakeholder group unique constraint validation", function () {
        stakeholdergroup.create();

        // Navigate to "New stakeholder group" page
        clickByText(button, createNewButton);

        // Check Name duplication
        inputText(stakeholdergroupNameInput, stakeholdergroup.name);
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created stakeholder group
        cy.get(commonView.closeButton).click();
        stakeholdergroup.delete();
    });
});
