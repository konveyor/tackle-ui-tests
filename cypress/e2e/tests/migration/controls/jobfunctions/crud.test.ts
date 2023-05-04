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
    exists,
    hasToBeSkipped,
    login,
    notExists,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import * as data from "../../../../../utils/data_utils";
import { migration } from "../../../../types/constants";

describe(["tier1"], "Job Function CRUD operations", () => {
    const jobfunction = new Jobfunctions(data.getJobTitle());

    before("Login", () => {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/hub/jobfunctions*").as("postJobfunction");
        cy.intercept("GET", "/hub/jobfunctions*").as("getJobfunctions");
    });

    it("Jobfunction CRUD", function () {
        selectUserPerspective(migration);

        // Create new job function
        jobfunction.create();
        cy.wait("@postJobfunction");
        exists(jobfunction.name);

        // Edit the current job function's name
        var updatedJobfuncName = data.getJobTitle();
        jobfunction.edit(updatedJobfuncName);
        cy.wait("@getJobfunctions");

        // Assert that jobfunction name got edited
        exists(updatedJobfuncName);

        // Delete job function
        jobfunction.delete();
        cy.wait("@getJobfunctions");

        // Assert that job function is deleted
        notExists(jobfunction.name);
    });
});
