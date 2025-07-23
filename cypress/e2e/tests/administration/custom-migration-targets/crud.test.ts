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
import { getRulesData } from "../../../../utils/data_utils";
import {
    click,
    clickByText,
    closeSuccessAlert,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    next,
    selectItemsPerPage,
} from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import {
    analyzeButton,
    button,
    CredentialType,
    Languages,
    SEC,
    UserCredentials,
} from "../../../types/constants";
import { cancelButton } from "../../../views/common.view";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";

describe(["@tier0", "@interop"], "Custom Migration Targets CRUD operations", () => {
    let appFixture: string;
    let analysisFixture: string;
    let languageLower: string;

    before(() => {
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });

    Object.values(Languages).forEach((language) => {
        describe(`Custom Migration Targets CRUD | ${language} language`, function () {
            // Automates Polarion TC 300 & 305

            beforeEach("Fixtures and Interceptors", function () {
                appFixture = "application";
                analysisFixture = "analysis";
                languageLower = language.toLowerCase();

                if (language !== Languages.Java) {
                    appFixture = `${languageLower}-application`;
                    analysisFixture = `${languageLower}-analysis`;
                }

                cy.fixture(appFixture).then(function (appData) {
                    this.appData = appData;
                });

                cy.fixture(analysisFixture).then(function (analysisData) {
                    this.analysisData = analysisData;
                });

                cy.fixture("custom-rules").then(function (customMigrationTargets) {
                    this.customMigrationTargets = customMigrationTargets;
                });

                cy.intercept("POST", "/hub/targets/*").as("postTarget");
                cy.intercept("GET", "/hub/targets*").as("getTargets");
                cy.intercept("PUT", "/hub/targets*/*").as("putTarget");
                cy.intercept("DELETE", "/hub/targets*/*").as("deleteTarget");

                CustomMigrationTarget.open(true);
                cy.wait("@getTargets", { timeout: 30 * SEC });
            });

            it("Custom Migration Targets CRUD with rules uploaded manually", function () {
                const targetData = this.customMigrationTargets[`${languageLower}_manual_rules`];
                const target = new CustomMigrationTarget(
                    data.getRandomWord(8),
                    data.getDescription(),
                    targetData.image,
                    getRulesData(targetData),
                    language
                );
                target.create();
                cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
                closeSuccessAlert();
                cy.get(CustomMigrationTargetView.card, { timeout: 12 * SEC }).should(
                    "contain",
                    target.name
                );

                const newName = data.getRandomWord(8);
                const newRules = {
                    ...target.ruleTypeData,
                    rulesetPaths: ["yaml/javax-package-custom.yaml"],
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
                cy.wait("@deleteTarget");
                cy.wait("@getTargets");
                cy.get(CustomMigrationTargetView.cardContainer).then((container) => {
                    if (container.children().length > 1) {
                        cy.contains(CustomMigrationTargetView.card, target.name, {
                            timeout: 5 * SEC,
                        }).should("not.exist");
                    }
                });
            });

            it("Create Custom Migration Target with rules from repository with credentials", function () {
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
                closeSuccessAlert();
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
                cy.wait("@deleteTarget");
                cy.wait("@getTargets");
                sourceCredential.delete();
            });

            it("Change layout and check in analysis wizard", function () {
                const targetData = this.customMigrationTargets[`${languageLower}_manual_rules`];
                const target = new CustomMigrationTarget(
                    data.getRandomWord(8),
                    data.getDescription(),
                    targetData.image,
                    getRulesData(targetData),
                    language
                );
                target.create();
                cy.wait("@getTargets");

                const target1 = new CustomMigrationTarget(
                    data.getRandomWord(8),
                    data.getDescription(),
                    targetData.image,
                    getRulesData(targetData),
                    language
                );
                // Two targets are required for Go to drag and change position.
                if (language == Languages.Go) {
                    target1.create();
                }
                closeSuccessAlert();
                cy.wait("@getTargets");

                const dragButton = cy
                    .contains(CustomMigrationTargetView.card, target.name, { timeout: 12 * SEC })
                    .find(CustomMigrationTargetView.dragButton);

                // Moves the custom migration target to the first place
                cy.dragAndDrop(dragButton, cy.get(CustomMigrationTargetView.cardContainer));
                cy.wait("@getTargets");

                Analysis.open(true);
                const application = new Analysis(
                    getRandomApplicationData("", {
                        sourceData: this.appData[`${languageLower}-example-app`],
                    }),
                    getRandomAnalysisData(this.analysisData["source_analysis"])
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

                // Make sure the new custom migration target is in the first position
                Analysis.selectLanguage(language, true);
                cy.get(".pf-v5-c-card__body", { timeout: 12 * SEC })
                    .first()
                    .should("contain", target.name);
                clickByText(button, "Cancel");

                target.delete();
                if (language == Languages.Go) {
                    target1.delete();
                }
                cy.wait("@deleteTarget");
                cy.wait("@getTargets");
                application.delete();
            });

            it("Custom rule with source and target technology", function () {
                const targetData = this.customMigrationTargets["rules_with_source_target_element"];
                const target = new CustomMigrationTarget(
                    data.getRandomWord(8),
                    data.getDescription(),
                    targetData.image,
                    getRulesData(targetData),
                    language,
                    targetData.sources
                );
                target.create();
                cy.wait("@getTargets");
                closeSuccessAlert();

                const application = new Analysis(
                    getRandomApplicationData("", {
                        sourceData: this.appData[`${languageLower}-example-app`],
                    }),
                    getRandomAnalysisData(this.analysisData["source_analysis"])
                );
                application.create();

                // TC MTA-404
                Analysis.open();
                selectItemsPerPage(100);
                application.selectApplication();
                cy.contains(button, analyzeButton, { timeout: 20 * SEC })
                    .should("be.enabled")
                    .click();

                application.selectSourceofAnalysis(application.source);
                cy.contains(button, "Next", { timeout: 200 }).click();

                Analysis.selectLanguage(language);
                application.selectTarget([target.name]);
                next();
                next();
                next();

                target.validateSourceTechnology(targetData.sources);

                // TC 405 - Validate Target technology
                cy.get(".pf-v5-c-wizard__main-body").should("contain", targetData.targets);
                clickByText(button, "Cancel");

                target.delete();
                cy.wait("@deleteTarget");
                cy.wait("@getTargets");
                application.delete();
            });
        });
    });
});
