/// <reference types="cypress" />

import { login, clickByText, inputText } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholdergroups } from "../../../types/constants";
import {
    stakeholdergroupNameInput,
    stakeholdergroupNameHelper,
    stakeholdergroupDescriptionInput,
    stakeholdergroupDescriptionHelper,
} from "../../../views/stakeholdergroups.view";

import * as commonView from "../../../../integration/views/commoncontrols.view";
import * as faker from "faker";

describe("Basic checks while creating stakeholder groups", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Navigate to "New stakeholder group" page
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        clickByText("button", "Create new");
    });

    it("Stakeholder name and description contraints check", function () {
        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Name constraints
        inputText(stakeholdergroupNameInput, "te");
        cy.get(stakeholdergroupNameHelper).should(
            "contain",
            "This field must contain at least 3 characters."
        );
        inputText(stakeholdergroupNameInput, faker.random.words(50));
        cy.get(stakeholdergroupNameHelper).should(
            "contain",
            "This field must contain fewer than 120 characters."
        );
        inputText(stakeholdergroupNameInput, "test");
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(stakeholdergroupDescriptionInput, faker.random.words(120));
        cy.get(stakeholdergroupDescriptionHelper).should(
            "contain",
            "This field must contain fewer than 250 characters."
        );
    });

    it("Cancel and close on stakholder group creation", function () {
        // Cancel creating stakeholder group
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText("button", "Create new");

        // Close create stakeholder group page
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Asserting stakholder groups page
        cy.contains("button", "Create new").should("exist");
    });
});
