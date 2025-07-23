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
import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    manageCredentialsForMultipleApplications,
    writeMavenSettingsFile,
} from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../../types/constants";
let source_credential: CredentialsSourceControlUsername;
let maven_credential: CredentialsMaven;
const sourceApplicationsList: Array<Analysis> = [];
const mavenApplicationsList: Array<Analysis> = [];

describe(["@tier2"], "Manage credentials source analysis", () => {
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

        // Create Maven credentials
        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, null, true)
        );
        maven_credential.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Adding source credentials to multiple apps", function () {
        let application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        sourceApplicationsList.push(application);

        application = new Analysis(
            getRandomApplicationData("tackle-testapp-public", {
                sourceData: this.appData["tackle-testapp-public"],
            }),
            getRandomAnalysisData(this.analysisData["tackle-testapp-public"])
        );
        sourceApplicationsList.push(application);

        sourceApplicationsList.forEach((currentApplication) => {
            currentApplication.create();
        });
        manageCredentialsForMultipleApplications(sourceApplicationsList, source_credential);
        sourceApplicationsList.forEach((currentApplication) => {
            currentApplication.analyze();
            currentApplication.verifyAnalysisStatus("Completed");
        });
    });

    it("Adding maven credentials to multiple apps", function () {
        let application = new Analysis(
            getRandomApplicationData("tackletestApp_MavenCreds", {
                sourceData: this.appData["tackle-testapp-public"],
            }),
            getRandomAnalysisData(this.analysisData["tackle-testapp-public"])
        );
        mavenApplicationsList.push(application);

        application = new Analysis(
            getRandomApplicationData("tackletestApp_binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );
        mavenApplicationsList.push(application);

        mavenApplicationsList.forEach((currentApplication) => {
            currentApplication.create();
        });
        manageCredentialsForMultipleApplications(mavenApplicationsList, maven_credential);
        mavenApplicationsList.forEach((currentApplication) => {
            currentApplication.analyze();
            currentApplication.verifyAnalysisStatus("Completed");
        });
    });

    after("Perform test data clean up", function () {
        deleteByList(sourceApplicationsList);
        deleteByList(mavenApplicationsList);
        source_credential.delete();
        maven_credential.delete();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
