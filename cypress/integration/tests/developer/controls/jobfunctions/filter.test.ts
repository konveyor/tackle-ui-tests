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
    applySearchFilter,
    hasToBeSkipped,
    createMultipleJobFunctions,
    selectUserPerspective,
    deleteByList,
    deleteAllJobfunctions,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import { controls, jobFunctions, button, name, clearAllFilters } from "../../../../types/constants";

import { Jobfunctions } from "../../../../models/developer/controls/jobfunctions";
import * as data from "../../../../../utils/data_utils";

let jobFunctionsList: Array<Jobfunctions> = [];
let invalidSearchInput = String(data.getRandomNumber());

describe("Job function filter validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        login();

        // Create multiple job functions
        jobFunctionsList = createMultipleJobFunctions(2);
    });

    after("Perform test data clean up", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the job functions
        deleteAllJobfunctions();
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

        // Assert that no search results are found
        cy.get("h2").contains("No job functions available");

        clickByText(button, clearAllFilters);
    });
});
