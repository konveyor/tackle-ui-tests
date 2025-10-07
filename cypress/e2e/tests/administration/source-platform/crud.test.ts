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

import * as data from "../../../../utils/data_utils";
import { checkSuccessAlert, exists, login, notExists } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { SourcePlatform } from "../../../models/administration/source-platform/source-platform";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { successAlertMessage } from "../../../views/common.view";

let sourceCredential: CredentialsSourceControlUsername;

describe(["@tier2"], "Source platform CRUD operations", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        sourceCredential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        sourceCredential.create();
    });

    it("Cloud Foundry Source platform crud tests", function () {
        const platform = new SourcePlatform(
            data.getRandomWord(8),
            "Cloud Foundry",
            url,
            sourceCredential.name
        );

        platform.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Source Platform ${platform.name} was successfully created.`,
            true
        );
        exists(platform.name);

        platform.delete();
        notExists(platform.name);
    });

    after("Clear test data", function () {
        sourceCredential.delete();
    });
});
