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
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import {
    CredentialType,
    UserCredentials,
} from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
let source_credential;
var applicationsList: Array<Analysis> = [];

describe(["@tier1"], "Source Analysis", () => {
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

    it("Apply search filter on app details page", function () {
        // Automates Polarion MTA-311
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source_autoTagging", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(3000);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.applicationDetailsTab("Tags");
        cy.wait(2000);

        // Filter tags by source:Analysis
        application.filterTags("Analysis");
        application.tagAndCategoryExists(
            this.analysisData["analysis_for_enableTagging"]["techTags"]
        );
        application.closeApplicationDetails();
        application.delete();
    });
});
