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
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    stakeholderGroups,
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
import * as data from "../../../../utils/data_utils";
import * as commonView from "../../../../integration/views/common.view";

describe("Stakeholder groups validations", { tags: "@tier2" }, () => {
    const stakeholdergroup = new Stakeholdergroups(data.getCompanyName(), data.getDescription());

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Stakeholder group field validations", function () {
        // Navigate to stakeholder group tab and click "Create New" button
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        clickByText(button, createNewButton);

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

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Stakholder group button validations", function () {
        // Navigate to stakeholder group tab and click "Create New" button
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating stakeholder group
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" stakeholder group form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that stakholder group tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Stakeholder group unique constraint validation", function () {
        // Create new stakeholder group
        stakeholdergroup.create();
        exists(stakeholdergroup.name);

        // Navigate to stakeholder group tab and click "Create New" button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(stakeholdergroupNameInput, stakeholdergroup.name);
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created stakeholder group
        cy.get(commonView.closeButton).click();
        stakeholdergroup.delete();
        notExists(stakeholdergroup.name);
    });
});
