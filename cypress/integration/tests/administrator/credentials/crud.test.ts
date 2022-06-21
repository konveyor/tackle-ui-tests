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
    exists,
    submitForm,
    clickByText,
    hasToBeSkipped,
    preservecookies,
    uploadfile,
} from "../../../../utils/utils";

import { createNewButton, button } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { Credentials } from "../../../models/administrator/credentials";
const filePath = "app_import/";

describe("Credentials CRUD operations", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/identities*").as("postCredentials");
        cy.intercept("GET", "/hub/identities*").as("getCredentials");
    });

    it("Credentials Source Control CRUD", function () {
        // Credential test
        const credential = new Credentials(
            "source_" + data.getFullName(),
            data.getDescription(),
            "Source Control",
            "Username/Password",
            data.getRandomWord(6),
            data.getRandomWord(6)
        );
        // Create new stakeholder
        credential.create();
        cy.wait("@postCredentials");
        exists(credential.name);
    });

    it("Credentials SSH CRUD", function () {
        const fileName = "git_ssh_keys";
        Credentials.clickCredentials();
        var cred_name = data.getFullName();
        clickByText(button, createNewButton);
        Credentials.fillName(cred_name);
        Credentials.fillDescription(data.getDescription());
        Credentials.selectType("Source Control");
        Credentials.selectUserCrdentials("Source Private Key/Passphrase");
        uploadfile(filePath + fileName);
        Credentials.fillPrivatePassphrase(data.getRandomWord(6));
        cy.wait(200);
        submitForm();
        exists(cred_name);
    });
});
