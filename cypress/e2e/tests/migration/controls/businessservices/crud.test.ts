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
    preservecookies,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";

import * as data from "../../../../../utils/data_utils";
import { migration } from "../../../../types/constants";

describe(["tier1"], "Business service CRUD operations", () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for business services
        cy.intercept("POST", "/hub/businessservices*").as("postBusinessService");
        cy.intercept("GET", "/hub/businessservices*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholders*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholders*").as("getStakeholders");
    });

    it("Business service CRUD", function () {
        const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());

        selectUserPerspective(migration);

        // Create new Business service
        businessService.create();
        cy.wait("@postBusinessService");
        exists(businessService.name);

        // Edit Business service's name
        let updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        cy.wait("@getBusinessService");
        exists(updatedBusinessServiceName);

        // Delete Business service
        businessService.delete();
        cy.wait("@getBusinessService");

        // Assert that Business service is deleted
        notExists(businessService.name);
    });

    it("Business service CRUD with owner", function () {
        selectUserPerspective(migration);

        // Create owner - stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");

        // Create new Business service with owner attached
        const businessService = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
        businessService.create();
        cy.wait("@postBusinessService");
        exists(businessService.name);

        // Edit Business service's name
        let updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        cy.wait("@getBusinessService");
        exists(updatedBusinessServiceName);

        // Delete Business service
        businessService.delete();
        cy.wait("@getBusinessService");

        // Assert that Business service is deleted
        notExists(businessService.name);

        // Delete stakeholder owner
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that stakeholder owner is deleted
        notExists(stakeholder.email);
    });
});
