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
    clickByText,
    exists,
    createMultipleJobFunctions,
    deleteByList,
    selectFilter,
    filterInputText,
} from "../../../../../utils/utils";
import { button, name, clearAllFilters } from "../../../../types/constants";

import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import * as data from "../../../../../utils/data_utils";

let jobFunctionsList: Array<Jobfunctions> = [];
let invalidSearchInput = String(data.getRandomNumber());

describe(["@tier2"], "Job function filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        jobFunctionsList = createMultipleJobFunctions(2);
    });

    it("Name filter validations", function () {
        Jobfunctions.openList();

        // Enter an existing display name substring and assert
        let validSearchInput = jobFunctionsList[0].name.substring(0, 3);
        selectFilter(name);
        filterInputText(validSearchInput, 0);

        exists(jobFunctionsList[0].name);
        clickByText(button, clearAllFilters);

        selectFilter(name);
        filterInputText(jobFunctionsList[1].name, 0);
        exists(jobFunctionsList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing display name substring and apply it as search filter
        selectFilter(name);
        filterInputText(invalidSearchInput, 0);

        // Assert that no search results are found
        cy.get("h2").contains("No job functions available");

        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        deleteByList(jobFunctionsList);
    });
});
