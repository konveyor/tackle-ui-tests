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
    clickByText,
    createMultipleStakeholders,
    createMultipleApplications,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    selectUserPerspective,
    createMultipleBusinessServices,
} from "../../../../utils/utils";
import { verifyApplicationRisk } from "../../../models/migration/reports/reports";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { navMenu } from "../../../views/menu.view";
import { businessService, migration, reports } from "../../../types/constants";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { BusinessServices } from "../../../models/migration/controls/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var applicationsList: Array<Assessment> = [];
var businessServiceList: Array<BusinessServices> = [];

describe(["tier2"], "Application risks tests", () => {
    var risktype = ["low", "medium", "high"];

    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();
        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(3);
        for (let i = 0; i < applicationsList.length; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment(risktype[i], [stakeholdersList[0].name]);
            applicationsList[i].verifyStatus("assessment", "Completed");

            // Perform application review
            applicationsList[i].perform_review(risktype[i]);
            applicationsList[i].verifyStatus("review", "Completed");
        }
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
        deleteApplicationTableRows();
    });

    it("Application risk validation", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3000);

        for (let i = 0; i < 3; i++) {
            verifyApplicationRisk(risktype[i], applicationsList[i].name);
        }
    });
});
