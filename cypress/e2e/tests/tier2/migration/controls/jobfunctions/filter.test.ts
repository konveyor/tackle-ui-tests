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
    applySearchFilter,
    clickByText,
    createMultipleJobFunctions,
    deleteByList,
    exists,
    login,
} from "../../../../../utils/utils";
import { button, clearAllFilters, name } from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";

let jobFunctionsList: Array<Jobfunctions> = [];
let invalidSearchInput = String(data.getRandomNumber());

describe(["@tier2"], "Job function filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        jobFunctionsList = createMultipleJobFunctions(2);
    });

    it("Name filter validations", function () {
        Jobfunctions.openList();

        // Enter an existing display name substring and assert
        let validSearchInput = jobFunctionsList[0].name.substring(0, 3);
        applySearchFilter(name, validSearchInput);
        exists(jobFunctionsList[0].name);
        clickByText(button, clearAllFilters);

        applySearchFilter(name, jobFunctionsList[1].name);
        exists(jobFunctionsList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing display name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);
        cy.get("h2").contains("No job function available");
        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        deleteByList(jobFunctionsList);
    });
});
