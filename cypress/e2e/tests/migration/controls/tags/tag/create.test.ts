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
import * as commonView from "../../../../../../e2e/views/common.view";
import * as data from "../../../../../../utils/data_utils";
import { checkSuccessAlert, clickByText, inputText } from "../../../../../../utils/utils";
import { Tag } from "../../../../../models/migration/controls/tags";
import { button, duplicateTagName, max120CharsMsg } from "../../../../../types/constants";
import {
    createTagButton,
    dropdownMenuToggle,
    nameInput,
    tagsHelper,
} from "../../../../../views/tags.view";

describe(["@tier2"], "Tag validations", () => {
    beforeEach("Persist session", function () {
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("GET", "/hub/tag*").as("getTag");
    });

    it("Tag field validations", function () {
        Tag.openList();
        clickByText(button, createTagButton);

        // Name constraints
        inputText(nameInput, data.getRandomWords(40));
        cy.get(tagsHelper).should("contain", max120CharsMsg);

        // Validate the create button is enabled with valid inputs
        inputText(nameInput, data.getRandomWord(5));
        cy.get(dropdownMenuToggle).click();
        clickByText(button, data.getRandomDefaultTagCategory());
        cy.get(commonView.submitButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();
    });

    it("Tag button validations", function () {
        Tag.openList();
        clickByText(button, createTagButton);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        cy.get(commonView.cancelButton).click();
        clickByText(button, createTagButton);

        cy.get(commonView.closeButton).click();
        cy.contains(button, createTagButton).should("exist");
    });

    it("Tag success alert and unique constraint validation", function () {
        const tag = new Tag(data.getRandomWord(5), data.getRandomDefaultTagCategory());
        tag.create();
        checkSuccessAlert(
            commonView.successAlertMessage,
            "Success alert:Tag was successfully created."
        );
        cy.wait("@postTag");

        // Check tag name duplication
        clickByText(button, createTagButton);
        inputText(nameInput, tag.name);
        cy.get(dropdownMenuToggle).click();
        clickByText(button, tag.tagCategory);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(tagsHelper).should("contain.text", duplicateTagName);
        cy.get(commonView.closeButton).click();

        tag.delete();
    });
});
