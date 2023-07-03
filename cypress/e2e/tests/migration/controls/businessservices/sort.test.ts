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
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    createMultipleStakeholders,
    createMultipleBusinessServices,
    deleteByList,
    clickOnSortButton,
} from "../../../../../utils/utils";
import { SortType, name, owner } from "../../../../types/constants";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var businessServicesList: Array<BusinessServices> = [];

describe(["@tier2"], "Business services sort validations", function () {
    before("Login and Create Test Data", function () {
        login();
        // Create data
        stakeholdersList = createMultipleStakeholders(2);
        businessServicesList = createMultipleBusinessServices(2, stakeholdersList);
    });

    beforeEach("Persist session", function () {
        // Interceptors
        cy.intercept("POST", "/hub/business-service*").as("postBusinessService");
        cy.intercept("GET", "/hub/business-service*").as("getBusinessService");
    });

    it("Name sort validations", function () {
        // Navigate to business services tab
        BusinessServices.openList();
        cy.get("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the business services by name in ascending order
        clickOnSortButton(name, SortType.ascending);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by name in descending order
        clickOnSortButton(name, SortType.descending);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Owner sort validations", function () {
        // Navigate to business services tab
        BusinessServices.openList();
        cy.get("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(owner);

        // Sort the business services by owner in ascending order
        clickOnSortButton(owner, SortType.ascending);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(owner);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by owner in descending order
        clickOnSortButton(owner, SortType.descending);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(owner);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        // Clean up data created.
        deleteByList(businessServicesList);
        deleteByList(stakeholdersList);
    });
});
