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

import { login } from "../../../../utils/utils";
import { CredentialType, SEC, UserCredentials } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administrator/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { getRulesData } from "../../../../utils/data_utils";

describe("Custom Migration Targets CRUD operations", { tags: ["@tier1", "@dc"] }, () => {
    beforeEach("Login", function () {
        login();

        cy.fixture("custom-rules").then(function (customMigrationTargets) {
            this.customMigrationTargets = customMigrationTargets;
        });

        cy.intercept("POST", "/hub/rulebundles*").as("postRule");
        cy.intercept("GET", "/hub/rulebundles*").as("getRule");
        cy.intercept("PUT", "/hub/rulebundles*/*").as("putRule");
        cy.intercept("DELETE", "/hub/rulebundles*/*").as("deleteRule");
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
});
