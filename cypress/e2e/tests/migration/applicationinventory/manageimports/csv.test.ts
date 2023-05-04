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
    openManageImportsPage,
    preservecookies,
    hasToBeSkipped,
} from "../../../../../utils/utils";
import { actionButton } from "../../../../views/applicationinventory.view";

describe(["@tier2"], "Manage imports tests", function () {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Go to application import page
        openManageImportsPage();
    });

    it("Download CSV template", function () {
        // Open action dropdown
        cy.get(actionButton).eq(1).click();
        // Click on option - Download CSV template
        cy.get("a.pf-c-dropdown__menu-item").contains("Download CSV template").click();
        // Check if file contains appropriate data
        cy.readFile("cypress/downloads/template_application_import.csv").should(
            "contain",
            "Customers"
        );
    });
});
