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
    createMultipleJobFunctions,
    deleteByList,
    itemsPerPageValidation,
    login,
    selectItemsPerPage,
    validatePagination,
} from "../../../../../utils/utils";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
let jobFunctionsList: Array<Jobfunctions> = [];

describe(["@tier3"], "Job functions pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        jobFunctionsList = createMultipleJobFunctions(11);
    });

    beforeEach("Interceptors", function () {
        cy.intercept("GET", "/hub/jobfunctions*").as("getJobfunctions");
    });

    it("Navigation button validations", function () {
        Jobfunctions.openList();
        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        Jobfunctions.openList();
        selectItemsPerPage(10);
        itemsPerPageValidation();
    });

    after("Perform test data clean up", function () {
        deleteByList(jobFunctionsList);
    });
});
