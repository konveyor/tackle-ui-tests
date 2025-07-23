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
    autoPageChangeValidations,
    createMultipleStakeholders,
    deleteAllRows,
    itemsPerPageValidation,
    login,
    selectItemsPerPage,
    validatePagination,
} from "../../../../../utils/utils";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { appTable } from "../../../../views/common.view";

describe(["@tier3"], "Stakeholder pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        createMultipleStakeholders(11);
    });

    beforeEach("Interceptors", function () {
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("Navigation button validations", function () {
        Stakeholders.openList();
        cy.get("@getStakeholders");
        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        Stakeholders.openList();
        cy.get("@getStakeholders");
        selectItemsPerPage(10);
        itemsPerPageValidation(appTable, "Email");
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        Stakeholders.openList();
        cy.get("@getStakeholders");
        selectItemsPerPage(10);
        autoPageChangeValidations(appTable, "Email", true);
    });

    after("Perform test data clean up", function () {
        deleteAllRows();
    });
});
