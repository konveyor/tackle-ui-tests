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
    selectItemsPerPage,
    deleteByList,
    createMultipleApplications,
    validatePagination,
    itemsPerPageValidation,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";

let applicationsList: Array<Application> = [];

describe(["@tier3"], "Application inventory pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        applicationsList = createMultipleApplications(11);
    });

    beforeEach("Persist session", function () {
        // Interceptors for Applications
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab
        Application.open(true);
        cy.wait("@getApplications");
        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        Application.open(true);
        cy.wait("@getApplications");
        itemsPerPageValidation();
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationsList);
    });
});
