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

import { cleanupDownloads, login, openManageImportsPage } from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { kebabMenuItem } from "../../../../views/applicationinventory.view";
import { manageImportsActionsButton } from "../../../../views/common.view";

describe(["@tier3"], "Manage imports tests", function () {
    before("Login", function () {
        login();
        cy.visit("/");
        Application.open();
        openManageImportsPage();
    });

    it("Download CSV template", function () {
        cy.get(manageImportsActionsButton).eq(0).click({ force: true });
        cy.get(kebabMenuItem).contains("Download CSV template").click();
        cy.readFile("cypress/downloads/template_application_import.csv").should(
            "contain",
            "Customers"
        );
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
