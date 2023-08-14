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

import { login, openManageImportsPage } from "../../../../../utils/utils";
import { topKebabMenu, kebabMenuItem } from "../../../../views/applicationinventory.view";

describe(["@tier2"], "Manage imports tests", function () {
    before("Login", function () {
        login();
        openManageImportsPage();
    });

    it("Download CSV template", function () {
        cy.get(topKebabMenu).eq(1).click();
        cy.get(kebabMenuItem).contains("Download CSV template").click();
        cy.readFile("cypress/downloads/template_application_import.csv").should(
            "contain",
            "Customers"
        );
    });
});
