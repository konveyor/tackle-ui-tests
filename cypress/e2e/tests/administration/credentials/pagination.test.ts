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
    createMultipleCredentials,
    deleteByList,
    login,
    validatePagination,
} from "../../../../utils/utils";
import { Credentials } from "../../../models/administration/credentials/credentials";

describe(["@tier3"], "Tag type pagination validations", function () {
    let createdCredentialsList: Array<Credentials> = [];
    before("Login and Create Test Data", () => {
        login();
        cy.visit("/");
        createdCredentialsList = createMultipleCredentials(12);
    });

    it("Navigation button validations", function () {
        Credentials.openList(10);
        validatePagination();
    });

    after("Removing credentials, created earlier", () => {
        deleteByList(createdCredentialsList);
    });
});
