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

import * as data from "../../../../../utils/data_utils";
import { exists, notExists } from "../../../../../utils/utils";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";

export function jobFunctionCRUD() {
    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/jobfunctions*").as("postJobfunction");
        cy.intercept("GET", "/hub/jobfunctions*").as("getJobfunctions");
    });

    it("Jobfunction CRUD", function () {
        const jobfunction = new Jobfunctions(data.getJobTitle());
        jobfunction.create();
        cy.wait("@postJobfunction");
        exists(jobfunction.name);

        const updatedJobfuncName = data.getJobTitle();
        jobfunction.edit(updatedJobfuncName);
        cy.wait("@getJobfunctions");
        exists(updatedJobfuncName);

        jobfunction.delete();
        cy.wait("@getJobfunctions");
        notExists(jobfunction.name);
    });
}
