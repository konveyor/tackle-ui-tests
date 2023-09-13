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
    click,
    doesExistText,
    login,
    validateTooLongInput,
    validateTooShortInput,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { RepositoryType, SEC } from "../../../types/constants";
import { cancelButton, submitButton } from "../../../views/common.view";

describe(["@tier1"], "Custom Migration Target Validations", () => {
    let target: CustomMigrationTarget;
    /**
     * Validations for Polarion TCs 299, 301, 303, 304 & 305
     * This suite is only for fields validations, see crud.test.ts for CRUD operations
     */
    before("Login", function () {
        login();
    });

    it("Name validations", function () {
        CustomMigrationTarget.openNewForm();
        cy.get(submitButton).should("be.disabled");

        validateTooShortInput(CustomMigrationTargetView.nameInput, "body");
        validateTooLongInput(CustomMigrationTargetView.nameInput);

        CustomMigrationTarget.fillName("Containerization");
        doesExistText("A custom target with this name already exists. Use a different name", true);

        cy.get(submitButton).should("be.disabled");
        click(cancelButton);
    });

    it("Rule files validations", function () {
        CustomMigrationTarget.openNewForm();
        CustomMigrationTarget.fillName(data.getRandomWord(5));

        CustomMigrationTarget.uploadRules(["xml/invalid-rule.windup.xml"]);
        doesExistText('Error: File "invalid-rule.windup.xml" is not a valid XML', true);

        doesExistText("0 of 1 files uploaded", true);

        cy.get(submitButton).should("be.disabled");

        CustomMigrationTarget.uploadRules(["xml/javax-package-custom.windup.xml"]);
        doesExistText("1 of 2 files uploaded", true);

        cy.get(submitButton).should("be.enabled");

        cy.get('button[aria-label="Remove from list"]').each((btn) => cy.wrap(btn).click());
        doesExistText("0 of 0 files uploaded", true);

        cy.get(submitButton).should("be.disabled");
        click(cancelButton);
    });

    it("Image Validations", function () {
        CustomMigrationTarget.openNewForm();
        cy.get(CustomMigrationTargetView.imageInput).focus();
        cy.on("uncaught:exception", (err, runnable) => {
            /**
             * This error is expected because if the image size is greater than 1MB, the UI will
             * reject the upload and the attachFile method won't complete because it can't verify
             * that the image was uploaded successfully
             */
            expect(err.message).to.include("File Not Found");
            return false;
        });
        CustomMigrationTarget.uploadImage("img/big-image.jpg");
        cy.get(CustomMigrationTargetView.imageInput).blur();
        cy.wait(2 * SEC);
        click(cancelButton);
    });

    it("Rule repository URL validation", function () {
        CustomMigrationTarget.openNewForm();
        click(CustomMigrationTargetView.retrieveFromARepositoryRadio);
        CustomMigrationTarget.selectRepositoryType(RepositoryType.git);

        CustomMigrationTarget.fillRepositoryUrl("   ");
        doesExistText("Must be a valid URL.", true);

        CustomMigrationTarget.fillRepositoryUrl("Invalid url");
        doesExistText("Must be a valid URL.", true);

        CustomMigrationTarget.fillRepositoryUrl("https://github.com/konveyor/tackle-testapp");
        doesExistText("Must be a valid URL.", false);
    });
});
