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

import { getDescription, getRandomWord } from "../../../../utils/data_utils";
import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { SubversionConfiguration } from "../../../models/administration/repositories/subversion";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses, CredentialType } from "../../../types/constants";
import { analysisDetailsEditor } from "../../../views/analysis.view";

describe(["@tier2"], "Test secure and insecure svn repository analysis", () => {
    const subversionConfiguration = new SubversionConfiguration();
    let sourceCredential: CredentialsSourceControlUsername;
    const applicationsList: Analysis[] = [];

    before("Login", function () {
        login();
        cy.visit("/");
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

    it("Analysis on SVN Repository(http) when filenames have special characters", function () {
        const application = new Analysis(
            getRandomApplicationData("Insecure svn when filenames have special characters", {
                sourceData: this.appData["bookserver-svn-branch"],
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
        const application = new Analysis(
            getRandomApplicationData("Insecure svn disabled bookserver app", {
                sourceData: this.appData["bookserver-svn-insecure"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        subversionConfiguration.disableInsecureSubversionRepositories();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(sourceCredential.name, null);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.failed);
        application.openAnalysisDetails();

        cy.get(analysisDetailsEditor)
            .eq(0)
            .click()
            .type("{ctrl}f")
            .focused()
            .clear()
            .wait(1000)
            // find the word 'snv.insecure.enabled'
            .type("snv.insecure.enabled", { delay: 0, force: true })
            .wait(3000);

        cy.get(analysisDetailsEditor)
            .eq(0)
            .then(($editor) => {
                expect($editor.text()).to.contain(
                    "http URL used with snv.insecure.enabled = FALSE",
                    "Analysis details don't contains the expected error message"
                );
            });
    });

    after("Perform test data clean up", () => {
        deleteByList(applicationsList);
        sourceCredential.delete();
    });
});
