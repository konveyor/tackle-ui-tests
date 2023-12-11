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
    createMultipleStakeholders,
    createMultipleApplications,
    selectUserPerspective,
    deleteByList,
} from "../../../../utils/utils";
import { verifyApplicationRisk } from "../../../models/migration/reports/reports";
import { navMenu } from "../../../views/menu.view";
import { legacyPathfinder, migration, reports, SEC } from "../../../types/constants";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Application } from "../../../models/migration/applicationinventory/application";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";

let stakeholdersList: Array<Stakeholders> = [];
let applicationsList: Array<Application> = [];

describe(["@tier2"], "Application risks tests", () => {
    let riskType = ["low", "medium", "high"];

    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(3);
        for (let i = 0; i < applicationsList.length; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment(riskType[i], stakeholdersList);
            applicationsList[i].verifyStatus("assessment", "Completed");

            // Perform application review
            applicationsList[i].perform_review(riskType[i]);
            applicationsList[i].verifyStatus("review", "Completed");
        }
    });

    it("Application risk validation", function () {
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        for (let i = 0; i < 3; i++) {
            verifyApplicationRisk(riskType[i], applicationsList[i].name);
        }
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(applicationsList);
    });
});
