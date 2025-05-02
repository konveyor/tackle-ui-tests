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

import * as data from "../../../utils/data_utils";
import {
    clickByText,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    resetURL,
    selectItemsPerPage,
} from "../../../utils/utils";
import { CustomMigrationTarget } from "../../models/administration/custom-migration-targets/custom-migration-target";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import {
    AnalysisStatuses,
    analyzeButton,
    button,
    CustomRuleType,
    SEC,
} from "../../types/constants";
import { RulesRepositoryFields } from "../../types/types";

describe(["tier3"], "Custom Migration Targets RBAC operations", function () {
    // Polarion TC 317 & 319
    let analysis: Analysis;
    let target: CustomMigrationTarget;
    const architect = new UserArchitect(data.getRandomUserData());
    const migrator = new UserMigrator(data.getRandomUserData());

    before("Create test data", function () {
        User.loginKeycloakAdmin();
        architect.create();
        migrator.create();

        login();
        cy.visit("/");
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
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Create custom migration target, then look for it on an analysis as admin user", function () {
        analysis = new Analysis(
            getRandomApplicationData("bookServerApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        analysis.create();

        cy.intercept("POST", "/hub/targets*").as("postRule");
        target.create();
        cy.wait("@postRule");
        cy.get(".pf-v5-c-card__body", { timeout: 12 * SEC })
            .should("contain", target.name)
            .then((_) => {
                assertTargetIsVisible(analysis, target);
                analyzeAndVerify(analysis);
            });
    });

    it("Look for created target on an analysis as architect user", function () {
        architect.login();
        assertTargetIsVisible(analysis, target);
        analyzeAndVerify(analysis);
        architect.logout();
    });

    it("Look for created target on an analysis as migrator user", function () {
        migrator.login();
        assertTargetIsVisible(analysis, target);
        analyzeAndVerify(analysis);
    });

    after("Clear test data", () => {
        login();
        cy.visit("/");
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
        cy.get("form .pf-v5-c-card__body", { timeout: 12 * SEC })
            .last()
            .should("contain", existingTarget.name)
            .and("contain", "Custom");

        clickByText(button, "Cancel");
        existingAnalysis.selectApplication();
    };

    const analyzeAndVerify = (analysis: Analysis) => {
        analysis.analyze();
        analysis.verifyAnalysisStatus(AnalysisStatuses.completed);
        analysis.openReport();
        resetURL();
    };
});
