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
    clickWithin,
} from "../../../../../../utils/utils";
import { navMenu, navTab } from "../../../../../views/menu.view";
import {
    controls,
    tags,
    button,
    max40CharMsg,
    fieldReqMsg,
    minCharsMsg,
    duplicateTagTypeName,
} from "../../../../../types/constants";
import {
    createTagtypeButton,
    nameInput,
    nameHelper,
    dropdownMenuToggle,
    rankInput,
    rankHelper,
    positiveRankMsg,
    colorHelper,
} from "../../../../../views/tags.view";
import { TagType } from "../../../../../models/developer/controls/tagtypes";

import * as commonView from "../../../../../views/common.view";
import * as data from "../../../../../../utils/data_utils";
import { modal } from "../../../../../views/common.view";

describe("Tag type validations", { tags: "@tier2" }, () => {
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

    it("Tag type field validations", function () {
        // Navigate to Tags tab and click "Create tag type" button
        selectUserPerspective("Developer");
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
        clickWithin(modal, dropdownMenuToggle);
        clickByText(button, data.getColor());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Tag type button validations", function () {
        // Navigate to Tags tab and click "Create tag type" button
        selectUserPerspective("Developer");
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
        selectUserPerspective("Developer");
        const tagType = new TagType(
            data.getRandomWord(5),
            data.getColor(),
            data.getRandomNumber(5, 15)
        );

        // Create a new tag type
        tagType.create();
        cy.wait(2000);

        // Click "Create tag type" button
        clickByText(button, createTagtypeButton);

        // Check tag type name duplication
        inputText(nameInput, tagType.name);
        clickWithin(modal, dropdownMenuToggle);
        clickByText(button, data.getColor());
        cy.get(nameHelper).should("contain.text", duplicateTagTypeName);
        cy.get(commonView.closeButton).click();

        // Delete created tag
        tagType.delete();
        cy.wait(2000);
    });
});
