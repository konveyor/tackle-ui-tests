/// <reference types="cypress" />

import { login, clickByText, inputText, submitForm, click } from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import {
    controls,
    tags,
    button,
    duplicateErrMsg,
    max40CharMsg,
    fieldReqMsg,
    minCharsMsg,
} from "../../../../types/constants";
import {
    createTagtypeButton,
    nameInput,
    nameHelper,
    dropdownMenuToggle,
    rankInput,
    rankHelper,
    positiveRankMsg,
    colorHelper,
} from "../../../../views/tags.view";
import { Tagtype } from "../../../../models/tags";

import * as commonView from "../../../../../integration/views/common.view";
import * as data from "../../../../../utils/data_utils";

describe("Tag type validations", () => {
    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("POST", "/api/controls/tag-type*").as("postTagtype");
        cy.intercept("GET", "/api/controls/tag-type*").as("getTagtypes");
    });

    it("Tag type field validations", function () {
        // Navigate to Tags tab and click "Create tag type" button
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        clickByText(button, createTagtypeButton);

        // Name constraints
        inputText(nameInput, data.getRandomWord(2));
        cy.get(nameHelper).should("contain", minCharsMsg);
        inputText(nameInput, data.getRandomWords(40));
        cy.get(nameHelper).should("contain", max40CharMsg);

        // Rank constraint
        inputText(rankInput, data.getRandomNumber(-10, -20));
        cy.get(rankHelper).should("contain", positiveRankMsg);

        // Color constraints
        cy.get(colorHelper).should("contain", fieldReqMsg);

        // Validate the create button is enabled with valid inputs
        inputText(nameInput, data.getRandomWord(6));
        inputText(rankInput, data.getRandomNumber(5, 15));
        click(dropdownMenuToggle);
        clickByText(button, data.getColor());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Tag type button validations", function () {
        // Navigate to Tags tab and click "Create tag type" button
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        clickByText(button, createTagtypeButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new tag type
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createTagtypeButton);

        // Close the "Create tag type" form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that Tags tab is opened
        cy.contains(button, createTagtypeButton).should("exist");
    });

    it("Tag type unique constraint validation", function () {
        const tagtype = new Tagtype(
            data.getRandomWord(5),
            data.getColor(),
            data.getRandomNumber(5, 15)
        );

        // Create a new tag type
        tagtype.create();
        cy.wait("@postTagtype");
        cy.wait(2000);

        // Navigate to tags tab and click "Create tag type" button
        clickByText(button, createTagtypeButton);

        // Check tag type name duplication
        inputText(nameInput, tagtype.name);
        click(dropdownMenuToggle);
        clickByText(button, data.getColor());
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Delete created tag
        tagtype.delete();
        cy.wait(2000);
    });
});
