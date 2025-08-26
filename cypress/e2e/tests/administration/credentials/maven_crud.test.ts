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
import { click, deleteByList } from "../../../../utils/utils";
import { CredentialsMaven } from "../../../models/administration/credentials/credentialsMaven";
import { CredentialType } from "../../../types/constants";
import { confirmButton } from "../../../views/common.view";

describe(["@tier3"], "Validation of Maven Credentials", () => {
    let mavenCredentials: CredentialsMaven[] = [];

    it("Creating Maven credentials", () => {
        const mavenCredentialsUsername = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven)
        );
        mavenCredentialsUsername.create();
        mavenCredentials.push(mavenCredentialsUsername);
    });

    it("Creating Default Maven credentials", () => {
        const defaultMavenCredentials = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven, null, false, null, true)
        );
        defaultMavenCredentials.create();
        mavenCredentials.push(defaultMavenCredentials);
        defaultMavenCredentials.verifyDefaultCredentialIcon();
    });

    it("Creating Maven credentials then setting as default", () => {
        const mavenCredentialsSetAsDefault = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven)
        );
        mavenCredentialsSetAsDefault.create();
        mavenCredentials.push(mavenCredentialsSetAsDefault);
        mavenCredentialsSetAsDefault.setAsDefaultViaActionsMenu();
        click(confirmButton);
        mavenCredentialsSetAsDefault.verifyDefaultCredentialIcon();
    });

    it("Unsetting default Maven credentials after creating it", () => {
        // Polarion TC: MTA-719
        const tempDefaultCred = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven, null, false, null, true)
        );

        tempDefaultCred.create();
        mavenCredentials.push(tempDefaultCred);
        tempDefaultCred.verifyDefaultCredentialIcon();
        tempDefaultCred.unsetAsDefaultViaActionsMenu();
        click(confirmButton);
        tempDefaultCred.verifyDefaultCredentialIcon();
    });

    after("Cleaning up", () => {
        deleteByList(mavenCredentials);
    });
});
