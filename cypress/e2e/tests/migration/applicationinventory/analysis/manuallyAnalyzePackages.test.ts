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

import * as data from "../../../../../utils/data_utils";
import { getRandomAnalysisData, getRandomApplicationData, login } from "../../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses, CredentialType, UserCredentials } from "../../../../types/constants";

let source_credential: CredentialsSourceControlUsername;
let application: Analysis;

describe(["@tier3"], "Select the list of packages to be analyzed manually", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Analyze the packages manually with excluded packages", function () {
        const analysisData = this.analysisData["analysis_for_manuallyAnalyzePackages"];
        application = new Analysis(
            getRandomApplicationData("testapp-excludePackages", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(analysisData)
        );
        application.create();
        application.manageCredentials(source_credential.name);
        cy.wait("@getApplication");

        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        application.validateExcludedIssues(
            this.analysisData["analysis_for_manuallyAnalyzePackages"]["issues"]
        );
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        application.delete();
        source_credential.delete();
    });
});
