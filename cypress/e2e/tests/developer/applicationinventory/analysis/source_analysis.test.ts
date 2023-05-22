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
    hasToBeSkipped,
    preservecookies,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
    getRandomApplicationData,
    getRandomAnalysisData,
    writeMavenSettingsFile,
    resetURL,
} from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administrator/credentials/credentialsMaven";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { CredentialsSourceControlUsername } from "../../../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../../models/administrator/credentials/credentialsSourceControlKey";
import { Proxy } from "../../../../models/administrator/proxy/proxy";
import { MavenConfiguration } from "../../../../models/administrator/repositories/maven";
let source_credential;
let maven_credential;
const mavenConfiguration = new MavenConfiguration();

describe("Source Analysis", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        deleteApplicationTableRows();

        //Disable all proxy settings
        Proxy.disableAllProxies();

        // Clears artifact repository
        mavenConfiguration.clearRepository();

        // Create source Credentials
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
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
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

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier1")) return;
        // Prevent hook from running, if the tag is excluded from run
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });

    it("Source Analysis on bookserver app without credentials", function () {
        // For source code analysis application must have source code URL git or svn
        cy.log(this.analysisData[0]);
        const application = new Analysis(
            getRandomApplicationData("bookserverApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Source + dependencies analysis on tackletest app", function () {
        // Source code analysis require both source and maven credentials
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies", {
                sourceData: this.appData[3],
            }),
            getRandomAnalysisData(this.analysisData[1])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Source + dependencies analysis on daytrader app", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-721
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_Source+dependencies", {
                sourceData: this.appData[1],
            }),
            getRandomAnalysisData(this.analysisData[2])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Analysis on daytrader app with maven credentials", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-751
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_MavenCreds", { sourceData: this.appData[1] }),
            getRandomAnalysisData(this.analysisData[2])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials("None", maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Source Analysis on tackle testapp", function () {
        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source", { sourceData: this.appData[3] }),
            getRandomAnalysisData(this.analysisData[6])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Analysis on tackle test app with ssh credentials", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-707
        const scCredsKey = new CredentialsSourceControlKey(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.sourcePrivateKey
            )
        );
        scCredsKey.create();
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_sshCreds", { sourceData: this.appData[4] }),
            getRandomAnalysisData(this.analysisData[6])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(scCredsKey.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Source Analysis on tackle testapp for svn repo type", function () {
        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_svnRepo", { sourceData: this.appData[5] }),
            getRandomAnalysisData(this.analysisData[6])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });
});
