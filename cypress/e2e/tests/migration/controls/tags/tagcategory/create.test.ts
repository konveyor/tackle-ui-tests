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

import { checkSuccessAlert, click, clickByText, inputText } from "../../../../../../utils/utils";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";
import {
    button,
    duplicateTagTypeName,
    max40CharMsg,
    minCharsMsg,
} from "../../../../../types/constants";
import {
    createTagCategoryButton,
    dropdownMenuTypeToggle,
    nameInput,
    tagsHelper,
} from "../../../../../views/tags.view";

import * as data from "../../../../../../utils/data_utils";
import * as commonView from "../../../../../views/common.view";

describe(["@tier2"], "Tag category validations", () => {
    it("Tag type field validations", function () {
        TagCategory.openList();
        clickByText(button, createTagCategoryButton);

        // Name constraints
        inputText(nameInput, data.getRandomWord(2));
        cy.get(tagsHelper).should("contain", minCharsMsg);
        inputText(nameInput, data.getRandomWords(40));
        cy.get(tagsHelper).should("contain", max40CharMsg);

        // Validate the create button is enabled with valid inputs
        inputText(nameInput, data.getRandomWord(6));
        click(dropdownMenuTypeToggle);
        clickByText(button, data.getColor());
        cy.get(commonView.submitButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();
    });

    it("Tag category button validations", function () {
        TagCategory.openList();
        clickByText(button, createTagCategoryButton);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();

        clickByText(button, createTagCategoryButton);
        cy.get(commonView.closeButton).click();
        cy.contains(button, createTagCategoryButton).should("exist");
    });

    it("Tag category success alert and unique constraint validation", function () {
        const tagCategory = new TagCategory(data.getRandomWord(5), data.getColor());

        tagCategory.create();
        checkSuccessAlert(
            commonView.successAlertMessage,
            "Success alert:Tag category was successfully created."
        );
        clickByText(button, createTagCategoryButton);
        inputText(nameInput, tagCategory.name);
        click(dropdownMenuTypeToggle);
        clickByText(button, data.getColor());
        cy.get(tagsHelper).should("contain.text", duplicateTagTypeName);
        cy.get(commonView.closeButton).click();
        tagCategory.delete();
    });
});
