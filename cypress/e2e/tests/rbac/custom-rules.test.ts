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
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    logout,
    preservecookies,
} from "../../../utils/utils";
import {
    AnalysisStatuses,
    application,
    CredentialType,
    UserCredentials,
} from "../../types/constants";
import { RulesRepositoryFields } from "../../types/types";
import * as data from "../../../utils/data_utils";
import { getRulesData } from "../../../utils/data_utils";
import { CustomMigrationTarget } from "../../models/administration/custom-migration-targets/custom-migration-target";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { User } from "../../models/keycloak/users/user";

describe(["tier2"], "Custom Rules RBAC operations", function () {
    // Polarion TC 318

    /**
     *  There are three separated analysis to improve the test performance
     *  This way once an application is created it doesn't need to be changed again for
     *  migrator and architect.
     */
    let analysisWithPublicRules: Analysis;
    let analysisWithPrivateRules: Analysis;
    let analysisWithPrivateRulesNoCred: Analysis;

    let sourceCredential: CredentialsSourceControlUsername;
    let target: CustomMigrationTarget;
    const architect = new UserArchitect(data.getRandomUserData());
    const migrator = new UserMigrator(data.getRandomUserData());

    before("Create test data", function () {
        if (hasToBeSkipped("@tier2")) return;
        User.loginKeycloakAdmin();
        architect.create();
        migrator.create();

        login();

        sourceCredential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        sourceCredential.create();
    });

    beforeEach("Persist session", function () {
        preservecookies();

        cy.fixture("custom-rules").then(function (customRules) {
            this.customRules = customRules;
        });

        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Admin, Rules from public repository", function () {
        analysisWithPublicRules = new Analysis(
            getRandomApplicationData("bookServerApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        analysisWithPublicRules.customRuleRepository = getRulesData(
            this.customRules.rules_from_bookServerApp
        ) as RulesRepositoryFields;
        analysisWithPublicRules.target = [];

        analysisWithPublicRules.create();
        analyzeAndVerify(analysisWithPublicRules, AnalysisStatuses.completed);
    });

    it("Admin, Rules from private repository with credentials", function () {
        analysisWithPrivateRules = new Analysis(
            getRandomApplicationData("bookServerApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        const repositoryData = {
            ...getRulesData(this.customRules.rules_from_tackle_testApp),
            credentials: sourceCredential,
        };
        analysisWithPrivateRules.customRuleRepository = repositoryData as RulesRepositoryFields;
        analysisWithPrivateRules.target = [];

        analysisWithPrivateRules.create();
        analyzeAndVerify(analysisWithPrivateRules, AnalysisStatuses.completed);
    });

    it("Admin, Rules from private repository without credentials", function () {
        analysisWithPrivateRulesNoCred = new Analysis(
            getRandomApplicationData("bookServerApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        analysisWithPrivateRulesNoCred.customRuleRepository = getRulesData(
            this.customRules.rules_from_tackle_testApp
        ) as RulesRepositoryFields;
        analysisWithPrivateRulesNoCred.target = [];

        analysisWithPrivateRulesNoCred.create();
        analyzeAndVerify(analysisWithPrivateRulesNoCred, AnalysisStatuses.failed);
        logout();
    });

    it("Architect, Rules from public repository", function () {
        architect.login();
        analyzeAndVerify(analysisWithPublicRules, AnalysisStatuses.completed);
    });

    it("Architect, Rules from private repository with credentials", function () {
        analyzeAndVerify(analysisWithPrivateRules, AnalysisStatuses.completed);
    });

    it("Architect, Rules from private repository without credentials", function () {
        analyzeAndVerify(analysisWithPrivateRulesNoCred, AnalysisStatuses.failed);
        architect.logout();
    });

    it("Migrator, Rules from public repository", function () {
        migrator.login();
        analyzeAndVerify(analysisWithPublicRules, AnalysisStatuses.completed);
    });

    it("Migrator, Rules from private repository with credentials", function () {
        analyzeAndVerify(analysisWithPrivateRules, AnalysisStatuses.completed);
    });

    it("Migrator, Rules from private repository without credentials", function () {
        analyzeAndVerify(analysisWithPrivateRulesNoCred, AnalysisStatuses.failed);
        migrator.logout();
    });

    after("Clear test data", () => {
        if (hasToBeSkipped("@tier2")) return;
        login();
        sourceCredential.delete();
        analysisWithPublicRules.delete();
        analysisWithPrivateRules.delete();
        analysisWithPrivateRulesNoCred.delete();
        User.loginKeycloakAdmin();
        architect.delete();
        migrator.delete();
    });

    const analyzeAndVerify = (analysis: Analysis, expectedStatus: AnalysisStatuses) => {
        analysis.analyze();
        analysis.verifyAnalysisStatus(expectedStatus);
    };
});
