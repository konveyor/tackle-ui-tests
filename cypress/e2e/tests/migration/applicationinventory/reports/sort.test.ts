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
    login,
    getRandomApplicationData,
    getRandomAnalysisData,
    resetURL,
    deleteByList,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Report } from "../../../../models/migration/applicationinventory/reportPage";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import * as data from "../../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";

let applicationsList: Analysis[] = [];

describe(["@tier2"], "Report Page's Sort Validation", () => {
    const report = new Report();
    let source_credential;
    let maven_credential;

    before("Login", function () {
        login();

        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();

        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        maven_credential.create();
    });

    beforeEach("Load Data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Sort by Name validation test using Upload Binary Analysis", function () {
        const application: any = new Analysis(
            getRandomApplicationData("Source+dependencies", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();

        // Sort the Application by Name
        report.applySortAction("Name");
        cy.wait(2000);
        report.matchAppsOrder();
    });

    it("Sort by Story points test using Upload Binary Analysis", function () {
        const application: any = new Analysis(
            getRandomApplicationData("sort_Source+dependencies", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();

        // Sort the Application by Story points
        report.applySortAction("Story Points");
        cy.wait(2000);
        report.matchStoryPointsOrder();
    });

    afterEach("Reset url", function () {
        resetURL();
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
    });
});
