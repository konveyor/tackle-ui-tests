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

import * as data from "../../../../utils/data_utils";
import {
    click,
    doesExistText,
    validateTooLongInput,
    validateTooShortInput,
} from "../../../../utils/utils";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { MustbeAValidRepositoryURL, RepositoryType } from "../../../types/constants";
import { cancelButton, submitButton } from "../../../views/common.view";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";

describe(["@tier3"], "Custom Migration Target Validations", () => {
    /**
     * Validations for Polarion TCs 299, 301, 303, 304 & 305
     * This suite is only for fields validations, see crud.test.ts for CRUD operations
     */

    beforeEach("Clear state", function () {
        CustomMigrationTarget.open(true);
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
        cy.get(submitButton).should("be.disabled");

        CustomMigrationTarget.uploadRules(["yaml/javax-package-custom.yaml"]);
        doesExistText("1 of 1 files uploaded", true);

        cy.get(submitButton).should("be.enabled");

        cy.get('button[aria-label="Remove from list"]').each((btn) => cy.wrap(btn).click());
        doesExistText("0 of 0 files uploaded", false);
        doesExistText("1 of 1 files uploaded", false);

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
        click(cancelButton);
    });

    it("Rule repository URL validation", function () {
        CustomMigrationTarget.openNewForm();
        click(CustomMigrationTargetView.retrieveFromARepositoryRadio);
        CustomMigrationTarget.selectRepositoryType(RepositoryType.git);

        CustomMigrationTarget.fillRepositoryUrl("   ");
        doesExistText(MustbeAValidRepositoryURL, true);

        CustomMigrationTarget.fillRepositoryUrl("Invalid url");
        doesExistText(MustbeAValidRepositoryURL, true);

        CustomMigrationTarget.fillRepositoryUrl("https://github.com/konveyor/tackle-testapp");
        doesExistText(MustbeAValidRepositoryURL, false);
    });
});
