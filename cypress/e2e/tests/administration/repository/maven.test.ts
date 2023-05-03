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

import { MavenConfiguration } from "../../../models/administration/repositories/maven";
import {
    configureRWX,
    deleteAllBusinessServices,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    isEnabled,
    isRwxEnabled,
    login,
    preservecookies,
    resetURL,
    writeMavenSettingsFile,
} from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import * as data from "../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { CredentialsMaven } from "../../../models/administration/credentials/credentialsMaven";
import { clearRepository } from "../../../views/repository.view";

let mavenConfiguration = new MavenConfiguration();
let source_credential;
let maven_credential;

describe(["@tier1"], "Test secure and insecure maven repository analysis", () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        deleteApplicationTableRows();

        //Create source and maven credentials required for analysis
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();
        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(
                CredentialType.maven,
                "None",
                true,
                "http://maven.pkg.github.com/konveyor/tackle-testapp"
            )
        );
        maven_credential.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", () => {
        if (hasToBeSkipped("@tier1")) return;
        configureRWX(true);
        login();
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        source_credential.delete();
        maven_credential.delete();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });

    it("Binary analysis with maven containing http url when insecure repository is allowed", function () {
        mavenConfiguration.enableInsecureMavenRepositories();

        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("binary_test_app", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );

        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
    });

    it("Binary analysis with maven containing http url when insecure repository is not allowed", function () {
        // The following test case should verify if the analysis is failed rather than completed,
        // but due to how maven structure works it will always pick the ( http ) link as ( https )
        // which means, it will always pass regardless if the insecure toggle is disabled or not
        // todo: find a workaround to this

        mavenConfiguration.disableInsecureMavenRepositories();

        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("binary_test_app", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );

        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
    });

    it("Perform clear repository", function () {
        login();
        MavenConfiguration.open();
        mavenConfiguration.clearRepository();
    });

    it("Perform RWX=false and validate that repository can't be cleaned", function () {
        MavenConfiguration.open();
        let rwxEnabled = isRwxEnabled();
        isEnabled(clearRepository, rwxEnabled);

        rwxEnabled = false;
        configureRWX(rwxEnabled);
        login();
        MavenConfiguration.open();
        isEnabled(clearRepository, rwxEnabled);
    });
});
