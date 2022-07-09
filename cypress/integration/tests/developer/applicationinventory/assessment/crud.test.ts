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
    deleteAllBusinessServices,
    preservecookies
} from "../../../../../utils/utils";
import { ApplicationInventory } from "../../../../models/developer/applicationinventory/applicationinventory";
import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";
import { sourceFields, binaryFields } from "./../analysis/analysis_config";

var businessservicesList: Array<BusinessServices> = [];

describe("Application crud operations", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        businessservicesList = createMultipleBusinessServices(1);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier1")) return;

        // Delete the business service created before the tests
        deleteAllBusinessServices();
    });

    it("Application created for Assessment", function () {
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription() // refering description value as comment
        );

        // Create new application
        application.create();
        exists(application.name);
        cy.wait("@postApplication");

        /*// Edit application's name
        var updatedApplicationName = data.getAppName();
        application.edit({ name: updatedApplicationName });
        exists(updatedApplicationName);
        cy.wait("@getApplication");*/

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        notExists(application.name);
    });

    it("Application created for source mode analysis", function () {
        // Navigate to application inventory tab and create new application
        //Create application
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription(),
            undefined,
            undefined,
            sourceFields.repoType,
            sourceFields.sourceRepo
        );
        application.create();
        exists(application.name);
        cy.wait("@getApplication");
        //cy.wait(2000);

        /*// Edit application's name
        var updatedApplicationName = data.getAppName();
        application.edit({ name: updatedApplicationName });
        exists(updatedApplicationName);
        cy.wait("@getApplication");*/

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        notExists(application.name);
    });

    it("Application created for binary mode analysis", function () {
        // Navigate to application inventory tab and create new application
        //Create application
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription(),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            binaryFields.group,
            binaryFields.artifact,
            binaryFields.version,
            binaryFields.packaging,
        );
        application.create();
        exists(application.name);
        cy.wait("@getApplication");
        //cy.wait(2000);

        /*// Edit application's name
        var updatedApplicationName = data.getAppName();
        application.edit({ name: updatedApplicationName });
        exists(updatedApplicationName);
        cy.wait("@getApplication");*/

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        notExists(application.name);
    });
});
