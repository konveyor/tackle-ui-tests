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
    clickOnSortButton,
    createMultipleBusinessServices,
    createMultipleStakeholders,
    deleteByList,
    getTableColumnData,
    login,
    verifySortAsc,
    verifySortDesc,
} from "../../../../../utils/utils";
import { name, owner, SortType } from "../../../../types/constants";

import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";

var stakeholdersList: Array<Stakeholders> = [];
var businessServicesList: Array<BusinessServices> = [];

describe(["@tier3"], "Business services sort validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        stakeholdersList = createMultipleStakeholders(2);
        businessServicesList = createMultipleBusinessServices(2, stakeholdersList);
    });

    beforeEach("Persist session", function () {
        // Interceptors
        cy.intercept("POST", "/hub/business-service*").as("postBusinessService");
        cy.intercept("GET", "/hub/business-service*").as("getBusinessService");
    });

    it("Name sort validations", function () {
        BusinessServices.openList();
        cy.get("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the business services by name in ascending order
        clickOnSortButton(name, SortType.ascending);
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by name in descending order
        clickOnSortButton(name, SortType.descending);
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Owner sort validations", function () {
        BusinessServices.openList();
        cy.get("@getBusinessService");
        const unsortedList = getTableColumnData(owner);

        // Sort the business services by owner in ascending order
        clickOnSortButton(owner, SortType.ascending);
        const afterAscSortList = getTableColumnData(owner);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by owner in descending order
        clickOnSortButton(owner, SortType.descending);
        const afterDescSortList = getTableColumnData(owner);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        deleteByList(businessServicesList);
        deleteByList(stakeholdersList);
    });
});
