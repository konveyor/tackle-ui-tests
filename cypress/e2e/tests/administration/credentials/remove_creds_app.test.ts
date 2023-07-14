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

import { getRandomAnalysisData, getRandomApplicationData, login } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
let source_credential;
let application;

describe(["@tier1"], "Validation of Source Control Credentials", () => {
    before("Login", function () {
        login();
        source_credential = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );

        source_credential.create();
        source_credential.inUse = true;
    });

    beforeEach("Load data", function () {
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Deleting credential that is in use by one application", function () {
        application = new Analysis(
            getRandomApplicationData(),
            getRandomAnalysisData(this.analysisData)
        );
        application.create();
        application.manageCredentials(source_credential.name);
        source_credential.delete();
    });

    after("Cleanup", () => {
        application.delete();
    });
});
