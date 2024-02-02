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
    clickWithinByText,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../utils/utils";
import { SubversionConfiguration } from "../../../models/administration/repositories/subversion";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import {
    AnalysisStatuses,
    button,
    CredentialType,
    SEC,
    UserCredentials,
} from "../../../types/constants";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { footer } from "../../../views/common.view";
import { getDescription, getRandomWord } from "../../../../utils/data_utils";

describe(["@tier1"], "Test secure and insecure svn repository analysis", () => {
    const subversionConfiguration = new SubversionConfiguration();
    let sourceCredential: CredentialsSourceControlUsername;
    let applicationsList: Analysis[] = [];

    before("Login", function () {
        login();
        sourceCredential = new CredentialsSourceControlUsername({
            type: CredentialType.sourceControl,
            name: getRandomWord(6),
            description: getDescription(),
            username: Cypress.env("svn_user"),
            password: Cypress.env("svn_password"),
        });
        sourceCredential.create();
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

    it("Analysis on insecure SVN Repository(http) when allowed", function () {
        subversionConfiguration.enableInsecureSubversionRepositories();

        const application = new Analysis(
            getRandomApplicationData("Insecure svn enabled bookserver app", {
                sourceData: this.appData["bookserver-svn-insecure"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(sourceCredential.name, null);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    it("Analysis on insecure SVN Repository(http) when not allowed", function () {
        subversionConfiguration.disableInsecureSubversionRepositories();

        const application = new Analysis(
            getRandomApplicationData("Insecure svn disabled bookserver app", {
                sourceData: this.appData["bookserver-svn-insecure"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(sourceCredential.name, null);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.failed);
        application.openAnalysisDetails();
        clickWithinByText(footer, button, "Close");
    });

    afterEach("Clear state", function () {
        Analysis.open(true);
    });

    after("Perform test data clean up", () => {
        deleteByList(applicationsList);
        sourceCredential.delete();
    });
});
