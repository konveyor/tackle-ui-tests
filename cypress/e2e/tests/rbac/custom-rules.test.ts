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
import { getRulesData } from "../../../utils/data_utils";
import { getRandomAnalysisData, getRandomApplicationData, login } from "../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses, CredentialType, SEC, UserCredentials } from "../../types/constants";
import { RulesRepositoryFields } from "../../types/types";

describe(["@tier2"], "Custom Rules RBAC operations", function () {
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
    const architect = new UserArchitect(data.getRandomUserData());
    const migrator = new UserMigrator(data.getRandomUserData());

    before("Create test data", function () {
        User.loginKeycloakAdmin();
        architect.create();
        migrator.create();

        login();
        cy.visit("/");
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
            getRandomApplicationData("bookServerApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
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
            getRandomApplicationData("bookServerApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
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
            getRandomApplicationData("bookServerApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        analysisWithPrivateRulesNoCred.customRuleRepository = getRulesData(
            this.customRules.rules_from_tackle_testApp
        ) as RulesRepositoryFields;
        analysisWithPrivateRulesNoCred.target = [];

        analysisWithPrivateRulesNoCred.create();
        analyzeAndVerify(analysisWithPrivateRulesNoCred, AnalysisStatuses.failed);
    });

    it("Architect, Rules from public and private(with and without credentials) repository", function () {
        architect.login();
        analyzeAndVerify(analysisWithPublicRules, AnalysisStatuses.completed);
        analyzeAndVerify(analysisWithPrivateRules, AnalysisStatuses.completed);
        analyzeAndVerify(analysisWithPrivateRulesNoCred, AnalysisStatuses.failed);
        architect.logout();
    });

    it("Migrator, Rules from public and private(with and without credentials)repository", function () {
        migrator.login();
        analyzeAndVerify(analysisWithPublicRules, AnalysisStatuses.completed);
        analyzeAndVerify(analysisWithPrivateRules, AnalysisStatuses.completed);
        analyzeAndVerify(analysisWithPrivateRulesNoCred, AnalysisStatuses.failed);
        migrator.logout();
    });

    after("Clear test data", () => {
        login();
        cy.visit("/");
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
        /**
         * Ensures that a new analysis starts before verifying its status
         * This waiting won't affect the test execution time because it overlaps an analysis time that will take more than 10 secs
         */
        cy.wait(10 * SEC);
        analysis.verifyAnalysisStatus(expectedStatus);
    };
});
