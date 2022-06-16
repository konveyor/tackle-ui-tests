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
    hasToBeSkipped,
    login,
    preservecookies,
    deleteAllStakeholders,
    createMultipleBusinessServices,
    deleteAllBusinessServices,
} from "../../../../../utils/utils";

import { ApplicationInventory } from "../../../../models/developer/applicationinventory/applicationinventory";

import * as data from "../../../../../utils/data_utils";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersNameList: Array<string> = [];
var businessservicesList: Array<BusinessServices> = [];

describe("Application assessment and review tests", { tags: "@tier1" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

        businessservicesList = createMultipleBusinessServices(1);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier1")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
        deleteAllBusinessServices();
    });

    it("Application assessment and review with low risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription()
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("low", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("low");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Application assessment and review with medium risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription()
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("medium", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("medium");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Application assessment and review with high risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription()
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("high", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Perform application review
        application.perform_review("high");
        cy.wait(2000);
        application.is_reviewed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });
});
