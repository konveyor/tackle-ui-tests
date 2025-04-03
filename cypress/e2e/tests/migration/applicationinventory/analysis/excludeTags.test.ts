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
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    resetURL,
} from "../../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../../types/constants";

let source_credential;
let application: Analysis;

describe.skip(["@tier2"], "Exclude Tags", () => {
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

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    it("Exclude Tags from report using source analysis", function () {
        // skipping until bug https://issues.redhat.com/browse/MTA-40 is fixed.
        // For source code analysis application must have source code URL git or svn
        application = new Analysis(
            getRandomApplicationData("testapp-excludePackages", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_excludeRuleTags"])
        );
        application.create();
        application.manageCredentials(source_credential.name);
        cy.wait("@getApplication");

        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();

        // Validate the report exclude Tags .
        // TC expected to fail due to bug https://issues.redhat.com/browse/MTA-40
        application.validateExcludedTags();
    });

    after("Perform test data clean up", function () {
        application.delete();
        source_credential.delete();
    });
});
