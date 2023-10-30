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
import { CredentialsProxy } from "../../../models/administration/credentials/credentialsProxy";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";

describe(["@tier2"], "Credentials fields validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();
    });

    it("Validate Proxy credential's fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        CredentialsProxy.validateFields();
    });

    it("Validate Source control credential's fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        CredentialsSourceControlUsername.validateFields();
    });
});
