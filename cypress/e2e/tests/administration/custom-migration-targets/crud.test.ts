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
    SEC,
    UserCredentials,
} from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { getRulesData } from "../../../../utils/data_utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";

describe(["@tier1", "@dc", "@interop"], "Custom Migration Targets CRUD operations", () => {
    // Automates Polarion TC 300 & 305
    beforeEach("Login", function () {
        login();

        cy.fixture("custom-rules").then(function (customMigrationTargets) {
            this.customMigrationTargets = customMigrationTargets;
        });

        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("POST", "/hub/rulesets*").as("postRule");
        cy.intercept("GET", "/hub/rulesets*").as("getRule");
        cy.intercept("PUT", "/hub/rulesets*/*").as("putRule");
        cy.intercept("DELETE", "/hub/rulesets*/*").as("deleteRule");
    });

    it("Custom Migration Targets CRUD with rules uploaded manually", function () {
        const targetData = this.customMigrationTargets.manual_rules;
        const target = new CustomMigrationTarget(
            data.getRandomWord(8),
            data.getDescription(),
            targetData.image,
            getRulesData(targetData)
        );
        target.create();
        cy.wait("@postRule");
        cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
        cy.get("article", { timeout: 12 * SEC }).should("contain", target.name);

        const newName = data.getRandomWord(8);
        const newRules = {
            ...target.ruleTypeData,
            rulesetPaths: ["xml/javax-package-custom.windup.xml"],
        };

        target.edit({
            name: newName,
            ruleTypeData: newRules,
        });
        cy.wait("@putRule");
        cy.get("article", { timeout: 12 * SEC }).should("contain", newName);
        target.name = newName;
        target.ruleTypeData = newRules;

        target.delete();
        cy.wait("@deleteRule");
        cy.get("article", { timeout: 12 * SEC }).should("not.contain", target.name);
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
        const targetData = this.customMigrationTargets.rules_from_tackle_testApp;
        const repositoryData = {
            ...getRulesData(targetData),
            credentials: sourceCredential,
        };

        const target = new CustomMigrationTarget(
            data.getRandomWord(8),
            data.getDescription(),
            targetData.image,
            repositoryData
        );

        target.create();
        cy.wait("@postRule");
        cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
        cy.get("article", { timeout: 12 * SEC }).should("contain", target.name);

        target.delete();
        cy.wait("@deleteRule");
        cy.get("article", { timeout: 12 * SEC }).should("not.contain", target.name);

        sourceCredential.delete();
    });

    it("Change layout", function () {
        const targetData = this.customMigrationTargets.manual_rules;
        const target = new CustomMigrationTarget(
            data.getRandomWord(8),
            data.getDescription(),
            targetData.image,
            getRulesData(targetData)
        );
        target.create();
        cy.wait("@postRule");

        const dragButton = cy
            .get("article", { timeout: 12 * SEC })
            .contains(target.name)
            .parents("article")
            .find(CustomMigrationTargetView.dragButton);

        // Moves the custom migration target to the first place
        dragButton.move({
            deltaX: Number.MIN_SAFE_INTEGER,
            deltaY: Number.MIN_SAFE_INTEGER,
        });

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
        cy.contains("button", analyzeButton, { timeout: 20000 }).should("be.enabled").click();

        application.selectSourceofAnalysis(application.source);
        cy.contains("button", "Next", { timeout: 200 }).click();

        cy.get("form article", { timeout: 12 * SEC })
            .children()
            .first()
            .should("contain", target.name);
        clickByText(button, "Cancel");

        target.delete();
        application.delete();
    });
});
