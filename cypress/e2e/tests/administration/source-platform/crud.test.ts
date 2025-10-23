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
import { checkSuccessAlert, deleteByList, exists, login, notExists } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { SourcePlatform } from "../../../models/administration/source-platform/source-platform";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { successAlertMessage } from "../../../views/common.view";

let cloudFoundryCreds: Array<CredentialsSourceControlUsername> = [];

describe(["@tier2"], "CRUD operations on Cloud Foundry Source platform", () => {
    before("Login", function () {
        if (
            !Cypress.env("cloudfoundry_user") ||
            !Cypress.env("cloudfoundry_password") ||
            !Cypress.env("cloudfoundry_url")
        ) {
            throw new Error(`One or more required Cloud Foundry env variables are missing in cypress.config.ts :
            \ncloudfoundry_user\ncloudfoundry_password\ncloudfoundry_url`);
        }
        login();
        cy.visit("/");
        for (let i = 0; i < 2; i++) {
            const creds = new CredentialsSourceControlUsername(
                data.getRandomCredentialsData(
                    CredentialType.sourceControl,
                    UserCredentials.usernamePassword,
                    false,
                    null,
                    null,
                    true
                )
            );
            creds.name = "CF-CREDS" + data.getRandomNumber(1, 200);
            creds.create();
            cloudFoundryCreds.push(creds);
        }
    });

    it.skip("Perform CRUD Tests on Cloud Foundry Source platform", function () {
        const platform = new SourcePlatform(
            "CF-" + data.getRandomNumber(1, 200),
            "Cloud Foundry",
            Cypress.env("cloudfoundry_url"),
            cloudFoundryCreds[0].name
        );

        platform.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Source platform ${platform.name} was successfully created.`,
            true
        );
        exists(platform.name);

        var newName = "CF-" + "updatedName" + data.getRandomNumber(1, 200);
        platform.edit({ name: newName });
        exists(newName);

        var newURL = "https://api.bosh-updated-lite.com";
        platform.edit({ url: newURL });
        exists(newName);

        var newCreds = cloudFoundryCreds[1].name;
        platform.edit({ credentials: newCreds });
        exists(newName);

        platform.delete();
        notExists(platform.name);
    });

    after("Clear test data", function () {
        deleteByList(cloudFoundryCreds);
    });
});
