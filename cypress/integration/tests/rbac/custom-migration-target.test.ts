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
    hasToBeSkipped,
    login,
    logout,
    preservecookies,
    selectItemsPerPage,
} from "../../../utils/utils";
import { analyzeButton, application, button, SEC } from "../../types/constants";
import * as data from "../../../utils/data_utils";
import {
    RulesRepositoryFields,
    CustomMigrationTarget,
    CustomRuleType,
} from "../../models/administrator/custom-migration-targets/custom-migration-target";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { User } from "../../models/keycloak/users/user";

describe("Custom Migration Targets RBAC operations", { tags: ["@tier2", "@dc"] }, function () {
    // Polarion TC 317
    let analysis: Analysis;
    let target: CustomMigrationTarget;
    const architect = new UserArchitect(data.getRandomUserData());
    const migrator = new UserMigrator(data.getRandomUserData());

    before("Create test data", function () {
        if (hasToBeSkipped("@tier2") && hasToBeSkipped("@dc")) return;
        User.loginKeycloakAdmin();
        architect.create();
        migrator.create();

        login();
        cy.fixture("custom-rules").then((customMigrationTargets) => {
            const targetData = customMigrationTargets.rules_from_bookServerApp;
            const repositoryData: RulesRepositoryFields = {
                ...targetData.repository,
                type: CustomRuleType.Repository,
            };

            target = new CustomMigrationTarget(
                data.getRandomWord(8),
                data.getDescription(),
                targetData.image,
                repositoryData
            );
        });
    });

    beforeEach("Persist session", function () {
        preservecookies();

        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Create custom migration target, then look for it on an analysis as admin user", function () {
        analysis = new Analysis(
            getRandomApplicationData("bookServerApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        analysis.create();

        cy.intercept("POST", "/hub/rulebundles*").as("postRule");
        target.create();
        cy.wait("@postRule");
        cy.get("article", { timeout: 12 * SEC })
            .should("contain", target.name)
            .then((_) => assertTargetIsVisible(analysis, target));

        logout();
    });

    it("Look for created target on an analysis as architect user", function () {
        architect.login();
        assertTargetIsVisible(analysis, target);
        architect.logout();
    });

    it("Look for created target on an analysis as migrator user", function () {
        migrator.login();
        assertTargetIsVisible(analysis, target);
        migrator.logout();
    });

    after("Clear test data", () => {
        if (hasToBeSkipped("@tier2") && hasToBeSkipped("@dc")) return;
        login();
        analysis.delete();
        target.delete();
        User.loginKeycloakAdmin();
        architect.delete();
        migrator.delete();
    });

    const assertTargetIsVisible = (
        existingAnalysis: Analysis,
        existingTarget: CustomMigrationTarget
    ) => {
        Analysis.open();
        selectItemsPerPage(100);
        existingAnalysis.selectApplication();
        cy.contains("button", analyzeButton, { timeout: 20000 }).should("be.enabled").click();

        existingAnalysis.selectSourceofAnalysis(analysis.source);
        cy.contains("button", "Next", { timeout: 200 }).click();

        // Ensures that the latest custom migration target created is the last one in the list
        cy.get("form article", { timeout: 12 * SEC })
            .children()
            .last()
            .should("contain", existingTarget.name)
            .and("contain", "Custom");

        clickByText(button, "Cancel");
    };
});
