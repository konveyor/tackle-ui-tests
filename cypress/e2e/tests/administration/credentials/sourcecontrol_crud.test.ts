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

import { login } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../models/administration/credentials/credentialsSourceControlKey";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../types/constants";

describe(["@tier2"], "Validation of Source Control Credentials", () => {
    let scCredsUsername;
    let scCredsKey;
    const toBeCanceled = true;

    before("Login", function () {
        // Perform login
        login();
        scCredsUsername = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );
        scCredsKey = new CredentialsSourceControlKey(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.sourcePrivateKey)
        );
    });

    it(
        "Creating source control credentials with username/password and cancelling without saving",
        { tags: ["@tier1", "@dc", "@interop"] },
        () => {
            scCredsUsername.create(toBeCanceled);
        }
    );

    it("Creating source control credentials with username/password", () => {
        scCredsUsername.create();
    });

    it("Editing source control credentials with username/password and cancelling without saving", () => {
        scCredsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl), toBeCanceled);
    });

    it("Editing source control credentials with username/password", () => {
        scCredsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    it("Creating source control credentials with source private key and cancelling without saving", () => {
        scCredsKey.create(toBeCanceled);
    });

    it("Creating source control credentials with source private key", () => {
        scCredsKey.create();
    });

    it("Editing source control credentials with source private key and cancelling without saving", () => {
        scCredsKey.edit(
            getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.sourcePrivateKey
            ),
            toBeCanceled
        );
    });

    it("Editing source control credentials with source private key", () => {
        scCredsKey.edit(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.sourcePrivateKey)
        );
    });

    it("Deleting source control credentials with username/password with cancellation", () => {
        scCredsUsername.delete(toBeCanceled);
    });

    it("Deleting source control credentials with source private key with cancellation", () => {
        scCredsKey.delete(toBeCanceled);
    });

    after("Cleaning up", () => {
        scCredsUsername.delete();
        scCredsKey.delete();
    });
});
