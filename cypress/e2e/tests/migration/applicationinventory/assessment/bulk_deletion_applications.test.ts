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
    createMultipleApplications,
    application_inventory_kebab_menu,
    navigate_to_application_inventory,
} from "../../../../../utils/utils";

import { Assessment } from "../../../../models/migration/applicationinventory/assessment";

let applicationList: Array<Assessment> = [];

describe(["@tier2"], "Bulk deletion of applications", () => {
    before("Login", function () {
        login();
    });

    beforeEach("Interceptors", function () {
        applicationList = createMultipleApplications(11);
        // Interceptors
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Bulk deletion of applications - Select page ", function () {
        navigate_to_application_inventory();
        // Click dropdown toggle button to make 'Select page' selection.
        cy.get("button[aria-label='Select']").click();
        cy.get("ul[role=menu] > li").contains("Select page").click();
        application_inventory_kebab_menu("Delete");
    });

    it("Bulk deletion of applications - Select all ", function () {
        navigate_to_application_inventory();
        // Click dropdown toggle button to make 'Select all' selection.
        cy.get("button[aria-label='Select']").click();
        cy.get("ul[role=menu] > li").contains("Select all").click();
        application_inventory_kebab_menu("Delete");
    });

    it("Bulk deletion of applications - Delete all apps by selecting checkbox ", function () {
        navigate_to_application_inventory();
        // Click 'bulk-selected-apps-checkbox'.
        cy.get("input#bulk-selected-items-checkbox").check({ force: true });
        application_inventory_kebab_menu("Delete");
    });
});
