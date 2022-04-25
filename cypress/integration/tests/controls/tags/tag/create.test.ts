/// <reference types="cypress" />

import {
    login,
    clickByText,
    inputText,
    submitForm,
    click,
    preservecookies,
    hasToBeSkipped, selectUserPerspective,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import {
    controls,
    tags,
    button,
    duplicateErrMsg,
    max40CharMsg,
    fieldReqMsg,
} from "../../../../types/constants";
import {
    createTagButton,
    nameInput,
    nameHelper,
    tagTypeHelper,
    dropdownMenuToggle,
} from "../../../../views/tags.view";
import { Tag } from "../../../../models/tags";

import * as commonView from "../../../../../integration/views/common.view";
import * as data from "../../../../../utils/data_utils";

describe("Tag validations", { tags: "@tier2" }, () => {
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
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("GET", "/hub/tag*").as("getTag");
    });

    it("Tag field validations", function () {
        // Navigate to Tags tab and click "Create tag" button
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        clickByText(button, createTagButton);

        // Name constraints
        inputText(nameInput, data.getRandomWords(40));
        cy.get(nameHelper).should("contain", max40CharMsg);

        // Tag Type constraints
        cy.get(tagTypeHelper).should("contain", fieldReqMsg);

        // Validate the create button is enabled with valid inputs
        inputText(nameInput, data.getRandomWord(5));
        click(dropdownMenuToggle);
        clickByText(button, data.getExistingTagtype());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Tag button validations", function () {
        // Navigate to Tags tab and click "Create tag" button
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        clickByText(button, createTagButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new tag
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createTagButton);

        // Close the "Create tag" form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that Tags tab is opened
        cy.contains(button, createTagButton).should("exist");
    });

    it("Tag unique constraint validation", function () {
        const tag = new Tag(data.getRandomWord(5), data.getExistingTagtype());

        // Create a new tag
        tag.create();
        cy.wait("@postTag");
        cy.wait(2000);

        // Navigate to tags tab and click "Create tag" button
        clickByText(button, createTagButton);

        // Check tag name duplication
        inputText(nameInput, tag.name);
        click(dropdownMenuToggle);
        clickByText(button, tag.tagtype);
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Delete created tag
        tag.delete();
        cy.wait(2000);
    });
});
