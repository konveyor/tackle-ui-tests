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
    clickByText,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    selectItemsPerPage,
} from "../../../../utils/utils";
import {
    analyzeButton,
    button,
    CredentialType,
    Languages,
    SEC,
    UserCredentials,
} from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { getRulesData } from "../../../../utils/data_utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { cancelButton } from "../../../views/common.view";
import * as commonView from "../../../views/common.view";

describe(["@tier1", "@dc"], "Custom Migration Targets CRUD operations", () => {
    before("Login", function () {
        login();
    });

    // Automates Polarion TC 300 & 305
    beforeEach("Fixtures and Interceptors", function () {
        cy.fixture("custom-rules").then(function (customMigrationTargets) {
            this.customMigrationTargets = customMigrationTargets;
        });

        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("POST", "/hub/targets/*").as("postRule");
        cy.intercept("GET", "/hub/targets*").as("getRule");
        cy.intercept("PUT", "/hub/targets*/*").as("putRule");
        cy.intercept("DELETE", "/hub/targets*/*").as("deleteRule");

        CustomMigrationTarget.open(true);
    });

    Object.values(Languages).forEach((language) => {
        it(`${language} | Custom Migration Targets CRUD with rules uploaded manually`, function () {
            const targetData = this.customMigrationTargets["manual_rules"];
            const target = new CustomMigrationTarget(
                data.getRandomWord(8),
                data.getDescription(),
                targetData.image,
                getRulesData(targetData),
                language
            );
            target.create();
            cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
            cy.get(CustomMigrationTargetView.card, { timeout: 12 * SEC }).should(
                "contain",
                target.name
            );

            const newName = data.getRandomWord(8);
            const newRules = {
                ...target.ruleTypeData,
                rulesetPaths: ["xml/javax-package-custom.windup.xml"],
            };

            target.edit({
                name: newName,
                ruleTypeData: newRules,
            });
            cy.get(CustomMigrationTargetView.card, { timeout: 12 * SEC }).should(
                "contain",
                newName
            );
            target.name = newName;
            target.ruleTypeData = newRules;

            target.delete();
            cy.wait("@deleteRule");
            cy.wait(3 * SEC);
            cy.get(CustomMigrationTargetView.cardContainer).then((container) => {
                if (container.children().length > 1) {
                    cy.get(CustomMigrationTargetView.card, { timeout: 12 * SEC }).should(
                        "not.contain",
                        target.name
                    );
                }
            });
        });
    });

    Object.values(Languages).forEach((language) => {
        it(`${language} | Create Custom Migration Target with rules from repository with credentials`, function () {
            const sourceCredential = new CredentialsSourceControlUsername(
                data.getRandomCredentialsData(
                    CredentialType.sourceControl,
                    UserCredentials.usernamePassword,
                    Cypress.env("git_password") && Cypress.env("git_user")
                )
            );

            sourceCredential.create();
            const targetData = this.customMigrationTargets["rules_from_tackle_testApp"];
            const repositoryData = {
                ...getRulesData(targetData),
                credentials: sourceCredential,
            };

            const target = new CustomMigrationTarget(
                data.getRandomWord(8),
                data.getDescription(),
                targetData.image,
                repositoryData,
                language
            );

            target.create();
            cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
            cy.get(CustomMigrationTargetView.card, { timeout: 12 * SEC }).should(
                "contain",
                target.name
            );

            // TC MTA-403
            target.openEditDialog();
            cy.get(CustomMigrationTargetView.credentialsInput).should(
                "have.value",
                sourceCredential.name
            );
            click(cancelButton);

            target.delete();
            cy.wait("@deleteRule");
            cy.wait(3 * SEC);
            cy.get(CustomMigrationTargetView.cardContainer).then((container) => {
                if (container.children().length > 1) {
                    cy.get(CustomMigrationTargetView.card, { timeout: 12 * SEC }).should(
                        "not.contain",
                        target.name
                    );
                }
            });

            sourceCredential.delete();
        });
    });

    Object.values(Languages).forEach((language) => {
        it(`${language} | Change layout and check in analysis wizard`, function () {
            const targetData = this.customMigrationTargets["manual_rules"];
            const target = new CustomMigrationTarget(
                data.getRandomWord(8),
                data.getDescription(),
                targetData.image,
                getRulesData(targetData),
                language
            );
            target.create();

            const dragButton = cy
                .contains(CustomMigrationTargetView.card, target.name, { timeout: 12 * SEC })
                .find(CustomMigrationTargetView.dragButton);

            // Moves the custom migration target to the first place
            cy.wait(SEC);
            cy.wait("@getRule");
            dragButton.drag(commonView.optionMenu, {
                force: true,
                waitForAnimations: false,
            });
            cy.wait(SEC);

            const application = new Analysis(
                getRandomApplicationData("bookserverApp", {
                    sourceData: this.appData["bookserver-app"],
                }),
                getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
            );
            application.create();

            Analysis.open();
            selectItemsPerPage(100);
            application.selectApplication();
            cy.contains(button, analyzeButton, { timeout: 20 * SEC })
                .should("be.enabled")
                .click();

            application.selectSourceofAnalysis(application.source);
            cy.contains(button, "Next", { timeout: 200 }).click();

            Analysis.selectLanguage(language);
            cy.get(".pf-v5-c-card__body", { timeout: 12 * SEC })
                .first()
                .should("contain", target.name);
            clickByText(button, "Cancel");

            target.delete();
            application.delete();
        });
    });
});
