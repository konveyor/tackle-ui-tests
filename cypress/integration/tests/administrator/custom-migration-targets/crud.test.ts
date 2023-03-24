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

import { hasToBeSkipped, login } from "../../../../utils/utils";
import { CredentialType, RepositoryType, SEC, UserCredentials } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import {
    CMTManualOrigin,
    CMTRepositoryOrigin,
    CustomMigrationTarget,
    CustomMigrationTargetOriginType,
} from "../../../models/administrator/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";

describe("Custom Migration Targets CRUD operations", { tags: ["@tier1", "@dc"] }, () => {
    beforeEach("Login", function () {
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@dc")) return;

        login();

        cy.intercept("POST", "/hub/rulebundles*").as("postRule");
        cy.intercept("GET", "/hub/rulebundles*").as("getRule");
        cy.intercept("PUT", "/hub/rulebundles*/*").as("putRule");
        cy.intercept("DELETE", "/hub/rulebundles*/*").as("deleteRule");
    });

    it(
        "Custom Migration Targets CRUD with manual upload",
        { tags: ["@tier1", "@dc"] },
        function () {
            CustomMigrationTarget.open();
            const target = new CustomMigrationTarget(
                data.getRandomWord(8),
                data.getDescription(),
                "img/cloud.png",
                {
                    type: CustomMigrationTargetOriginType.Manual,
                    rulesetPath: "xml/javax-package-custom-target.windup.xml",
                }
            );
            target.create();
            cy.wait("@postRule");
            cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
            cy.get("article", { timeout: 12 * SEC }).should("contain", target.name);

            const newName = data.getRandomWord(8);
            const newRules: CMTManualOrigin = {
                type: CustomMigrationTargetOriginType.Manual,
                rulesetPath: "xml/javax-package-custom.windup.xml",
            };

            target.edit({
                name: newName,
                rulesOrigin: newRules,
            });
            cy.wait("@putRule");
            cy.get("article", { timeout: 12 * SEC }).should("contain", newName);
            target.name = newName;
            target.rulesOrigin = newRules;

            target.delete();
            cy.wait("@deleteRule");
            cy.get("article", { timeout: 12 * SEC }).should("not.contain", target.name);
        }
    );

    it(
        "Create Custom Migration Target with repository fetching",
        { tags: ["@tier1", "@dc"] },
        function () {
            const sourceCredential = new CredentialsSourceControlUsername(
                data.getRandomCredentialsData(
                    CredentialType.sourceControl,
                    UserCredentials.usernamePassword,
                    true
                )
            );
            sourceCredential.create();

            const repositoryData: CMTRepositoryOrigin = {
                type: CustomMigrationTargetOriginType.Repository,
                repositoryType: RepositoryType.git,
                repositoryUrl: "https://github.com/konveyor/tackle-testapp",
                rootPath: "rules",
                credentials: sourceCredential,
            };

            CustomMigrationTarget.open();
            const target = new CustomMigrationTarget(
                data.getRandomWord(8),
                data.getDescription(),
                "img/cloud.png",
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
        }
    );
});
