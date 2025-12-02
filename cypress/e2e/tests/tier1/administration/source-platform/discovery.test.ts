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
import { deleteApplicationTableRows, exists, login, sidedrawerTab } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { SourcePlatform } from "../../../models/administration/source-platform/source-platform";
import { CredentialType, UserCredentials } from "../../../types/constants";

let cfCreds: CredentialsSourceControlUsername;
let cfInstance: SourcePlatform;

describe(["@tier1"], "Cloud Foundry discovery", () => {
    before("Verify Cloud Foundry env variables are present", function () {
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
        deleteApplicationTableRows();
        cfCreds = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                false,
                null,
                null,
                true
            )
        );
        cfCreds.name = `CF-CREDS-${data.getRandomNumber(1, 500)}`;
        cfCreds.create();

        cfInstance = new SourcePlatform(
            `CF-${data.getRandomNumber(1, 500)}`,
            "Cloud Foundry",
            Cypress.env("cloudfoundry_url"),
            cfCreds.name
        );
        cfInstance.create();
    });

    it("Discover a single CF application", function () {
        const CFApp = "hello-spring-cloud";
        cfInstance.discover("org", CFApp, "space");

        // Click 'Applications' link for the CF instance
        cy.contains(cfInstance.name)
            .closest("tr")
            .find('a[href*="applications"]')
            .click({ force: true });
        exists(CFApp);

        // Verify discovery manifest is generated for the CF app
        sidedrawerTab(CFApp, "Platform");
        cy.contains("Application discovery manifest")
            .parents(".drawer-tab-content__section")
            .find('[class*="code-editor__code"]')
            .should("exist");
    });

    after("Clear test data", function () {
        deleteApplicationTableRows();
        cfInstance.delete();
        cfCreds.delete();
    });
});
