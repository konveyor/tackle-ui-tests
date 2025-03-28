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
    createMultipleArchetypes,
    deleteAllArchetypes,
    deleteAllRows,
    goToLastPage,
    itemsPerPageValidation,
    login,
    selectItemsPerPage,
    validatePagination,
} from "../../../../utils/utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
let archetypeList: Archetype[] = [];

describe(["@tier3"], "Archetypes pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        archetypeList = createMultipleArchetypes(11);
    });

    it("Navigation button validations", function () {
        Archetype.open();
        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        Archetype.open();
        itemsPerPageValidation();
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        Archetype.open();
        selectItemsPerPage(10);
        goToLastPage();
        deleteAllRows();
        // Verify that page is re-directed to previous page
        cy.get("td[data-label=Name]").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });
    });

    after("Perform test data clean up", function () {
        deleteAllArchetypes();
    });
});
