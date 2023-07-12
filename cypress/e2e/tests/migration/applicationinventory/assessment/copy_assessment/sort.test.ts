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
    sortAscCopyAssessmentTable,
    sortDescCopyAssessmentTable,
    verifySortAsc,
    verifySortDesc,
    getColumnDataforCopyAssessmentTable,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleApplications,
    deleteByList,
} from "../../../../../../utils/utils";
import { name } from "../../../../../types/constants";
import { Stakeholders } from "../../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../../models/migration/controls/stakeholdergroups";
import { Assessment } from "../../../../../models/migration/applicationinventory/assessment";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var applicationList: Array<Assessment> = [];

describe(["@tier2"], "Copy assessment and review tests", () => {
    before("Login and Create Test Data", function () {
        login();
        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        stakeholdergroupsList = createMultipleStakeholderGroups(1, stakeholdersList);
        applicationList = createMultipleApplications(4);

        // Perform assessment of application
        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        applicationList[0].verifyStatus("assessment", "Completed");
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Application name sort validations", function () {
        // Navigate to application inventory page and open copy assessment page
        applicationList[0].openCopyAssessmentModel();
        cy.wait(2000);

        // get unsorted list when page loads
        const unsortedList = getColumnDataforCopyAssessmentTable(name);

        // Sort the applications groups by name in ascending order
        sortAscCopyAssessmentTable(name);
        cy.wait(2000);

        // Verify that the applications rows are displayed in ascending order
        const afterAscSortList = getColumnDataforCopyAssessmentTable(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the applications by name in descending order
        sortDescCopyAssessmentTable(name);
        cy.wait(2000);

        // Verify that the applications are displayed in descending order
        const afterDescSortList = getColumnDataforCopyAssessmentTable(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
        deleteByList(stakeholdersList);
        deleteByList(stakeholdergroupsList);
    });
});
