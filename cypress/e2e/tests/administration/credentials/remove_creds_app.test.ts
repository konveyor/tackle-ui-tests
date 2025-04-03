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

import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { getRandomAnalysisData, getRandomApplicationData, login } from "../../../../utils/utils";
import { Credentials } from "../../../models/administration/credentials/credentials";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { CredentialType, SEC, tdTag, trTag, UserCredentials } from "../../../types/constants";
let source_credential: CredentialsSourceControlUsername;
let application: Analysis;

describe(["@tier3"], "Validation of credentials being used by app", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        source_credential = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );

        source_credential.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Validating cred used by app can't be deleted", function () {
        application = new Analysis(
            getRandomApplicationData(),
            getRandomAnalysisData(this.analysisData)
        );
        application.create();
        application.manageCredentials(source_credential.name);
        Credentials.openList();
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(source_credential.name, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                cy.get("#delete-button").should("have.class", "pf-m-aria-disabled");
            });
    });

    after("Cleanup", () => {
        application.delete();
        source_credential.delete();
    });
});
