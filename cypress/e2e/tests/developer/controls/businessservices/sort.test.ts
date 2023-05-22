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
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleBusinessServices,
    deleteAllBusinessServices,
    deleteAllStakeholders,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import { controls, businessServices, name, owner } from "../../../../types/constants";

import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var businessservicesList: Array<BusinessServices> = [];

describe(["@tier2"], "Business services sort validations", function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        //Delete pre-existing data
        deleteAllBusinessServices();
        // Create data
        stakeholdersList = createMultipleStakeholders(2);
        businessservicesList = createMultipleBusinessServices(2, stakeholdersList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/business-service*").as("postBusinessService");
        cy.intercept("GET", "/hub/business-service*").as("getBusinessService");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the bussiness services and stakeholders created before the tests
        deleteAllBusinessServices();
        deleteAllStakeholders();
    });

    it("Name sort validations", function () {
        // Navigate to business services tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
        cy.get("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the business services by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Owner sort validations", function () {
        // Navigate to business services tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
        cy.get("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(owner);

        // Sort the business services by owner in ascending order
        sortAsc(owner);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(owner);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by owner in descending order
        sortDesc(owner);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(owner);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
