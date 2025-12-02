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
import { CredentialsProxy } from "../../../models/administration/credentials/credentialsProxy";
import { CredentialType } from "../../../types/constants";

describe(["@tier2"], "Validation of proxy credentials", () => {
    const proxyCreds = new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy));
    const toBeCanceled = true;
    const validConfiguration = {
        type: "Proxy",
        name: "ValidProxyCredentials",
        description: "This is valid data credentials",
        username: "redhat",
        password: "redhat",
    };

    it("Creating proxy credentials and cancelling without saving", () => {
        proxyCreds.create(toBeCanceled);
    });

    it("Creating proxy credentials", () => {
        proxyCreds.create();
    });

    it("Editing proxy credentials and cancelling without saving", () => {
        proxyCreds.edit(validConfiguration, toBeCanceled);
    });

    it("Editing proxy credentials", () => {
        proxyCreds.edit(validConfiguration);
    });

    it("Delete proxy credentials and cancel deletion", () => {
        proxyCreds.delete(toBeCanceled);
    });

    after("Delete proxy credentials", () => {
        proxyCreds.delete();
    });
});
