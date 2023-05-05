/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />
import {
    login,
    clickByText,
    inputText,
    preservecookies,
    hasToBeSkipped,
    selectUserPerspective,
} from "../../../../../../utils/utils";
import { navMenu, navTab } from "../../../../../views/menu.view";
import {
    controls,
    tags,
    button,
    fieldReqMsg,
    max120CharsMsg,
    duplicateTagName,
} from "../../../../../types/constants";
import {
    createTagButton,
    nameInput,
    nameHelper,
    tagCategoryHelper,
    dropdownMenuToggle,
} from "../../../../../views/tags.view";
import { Tag } from "../../../../../models/migration/controls/tags";
import * as commonView from "../../../../../../e2e/views/common.view";
import * as data from "../../../../../../utils/data_utils";

describe(["@tier2"], "Tag validations", () => {
    before("Login", function () {
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
        Tag.openList();
        clickByText(button, createTagButton);

        // Name constraints
        inputText(nameInput, data.getRandomWords(40));
        cy.get(nameHelper).should("contain", max120CharsMsg);

        // Tag Type constraints
        cy.get(tagCategoryHelper).should("contain", fieldReqMsg);

        // Validate the create button is enabled with valid inputs
        inputText(nameInput, data.getRandomWord(5));
        cy.get(dropdownMenuToggle).eq(2).click();
        clickByText(button, data.getRandomDefaultTagCategory());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Tag button validations", function () {
        // Navigate to Tags tab and click "Create tag" button
        Tag.openList();
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
        const tag = new Tag(data.getRandomWord(5), data.getRandomDefaultTagCategory());

        // Create a new tag
        selectUserPerspective("Migration");
        tag.create();
        cy.wait("@postTag");
        cy.wait(2000);

        // Navigate to tags tab and click "Create tag" button
        clickByText(button, createTagButton);

        // Check tag name duplication
        inputText(nameInput, tag.name);
        cy.get(dropdownMenuToggle).eq(2).click();
        clickByText(button, tag.tagCategory);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.nameHelper).should("contain.text", duplicateTagName);
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Delete created tag
        tag.delete();
        cy.wait(2000);
    });
});
