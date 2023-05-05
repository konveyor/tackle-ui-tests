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
    hasToBeSkipped,
    login,
    preservecookies,
    validateTooShortInput,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { RepositoryType } from "../../../types/constants";

describe(["@tier1"], "Custom Migration Target Validations", () => {
    let target: CustomMigrationTarget;
    /**
     * Validations for Polarion TCs 299, 301, 303, 304 & 305
     * This suite is only for fields validations, see crud.test.ts for CRUD operations
     */
    before("Login", function () {
        login();
    });

    beforeEach(function () {
        preservecookies();
    });

    it("Name validations", function () {
        CustomMigrationTarget.openNewForm();
        cy.get(CustomMigrationTargetView.createSubmitButton).should("be.disabled");

        validateTooShortInput(CustomMigrationTargetView.nameInput, "body");
        validateTooShortInput(CustomMigrationTargetView.nameInput);

        CustomMigrationTarget.fillName("Containerization");
        cy.get(CustomMigrationTargetView.nameHelper).contains(
            "A custom target with this name already exists. Use a different name"
        );

        cy.get(CustomMigrationTargetView.createSubmitButton).should("be.disabled");
        cy.contains("Cancel").click();
    });

    it("Rule files validations", function () {
        CustomMigrationTarget.openNewForm();
        CustomMigrationTarget.fillName(data.getRandomWord(5));

        CustomMigrationTarget.uploadRules(["xml/invalid-rule.windup.xml"]);
        cy.get(CustomMigrationTargetView.ruleHelper).should(
            "contain",
            'Error: File "invalid-rule.windup.xml" is not a valid XML'
        );
        cy.get(CustomMigrationTargetView.ruleFilesToggle).should(
            "contain",
            "0 of 1 files uploaded"
        );
        cy.get(CustomMigrationTargetView.createSubmitButton).should("be.disabled");

        CustomMigrationTarget.uploadRules(["xml/javax-package-custom.windup.xml"]);
        cy.get(CustomMigrationTargetView.ruleFilesToggle).should(
            "contain",
            "1 of 2 files uploaded"
        );
        cy.get(CustomMigrationTargetView.createSubmitButton).should("be.enabled");

        cy.get('button[aria-label="Remove from list"]').each((btn) => cy.wrap(btn).click());

        cy.get(CustomMigrationTargetView.ruleFilesToggle).should(
            "contain",
            "0 of 0 files uploaded"
        );
        cy.get(CustomMigrationTargetView.createSubmitButton).should("be.disabled");
        cy.contains("Cancel").click();
    });

    it("Image Validations", function () {
        CustomMigrationTarget.openNewForm();
        cy.get(CustomMigrationTargetView.imageInput).focus();
        CustomMigrationTarget.uploadImage("img/big-image.jpg");
        cy.get(CustomMigrationTargetView.imageInput).blur();
        cy.get(CustomMigrationTargetView.imageHelper).should(
            "contain",
            "Max image file size of 1 MB exceeded."
        );
    });

    it("Rule repository URL validation", function () {
        // Fails due to bug 484
        CustomMigrationTarget.openNewForm();
        click(CustomMigrationTargetView.retrieveFromARepositoryRadio);
        CustomMigrationTarget.selectRepositoryType(RepositoryType.git);

        CustomMigrationTarget.fillRepositoryUrl("   ");
        cy.get(CustomMigrationTargetView.repositoryUrlHelper).should(
            "contain",
            "Must be a valid URL."
        );

        CustomMigrationTarget.fillRepositoryUrl("Invalid url");
        cy.get(CustomMigrationTargetView.repositoryUrlHelper).should(
            "contain",
            "Must be a valid URL."
        );

        CustomMigrationTarget.fillRepositoryUrl("https://github.com/konveyor/tackle-testapp");
        cy.get(CustomMigrationTargetView.repositoryUrlHelper).should(
            "not.contain",
            "Must be a valid URL."
        );
    });
});
