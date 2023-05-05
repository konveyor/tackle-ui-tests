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
    createMultipleBusinessServices,
    getRandomApplicationData,
} from "../../../../../utils/utils";
import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";

describe(["@tier1"], "Application crud operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();
        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Application crud", function () {
        const application = new Assessment(getRandomApplicationData());

        // Create new application
        application.create();
        exists(application.name);
        cy.wait("@postApplication");

        // Edit application's name
        var updatedApplicationName = data.getAppName();
        application.edit({ name: updatedApplicationName });
        exists(updatedApplicationName);
        cy.wait("@getApplication");

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        notExists(application.name);
    });
});
