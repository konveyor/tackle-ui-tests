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
    createMultipleApplications,
    createMultipleStakeholders,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    deleteByList,
    login,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../models/migration/applicationinventory/application";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";
import { legacyPathfinder } from "../../../types/constants";

let stakeholdersList: Array<Stakeholders> = [];
let applicationsList: Array<Application> = [];
const totalApplications = "8";
const highRiskApps = 3;
const mediumRiskApps = 1;
const lowRiskApps = 2;
const unknownRiskApps = 2;

let riskType = ["low", "medium", "high", "low", "high", "high"];

describe(["@tier3"], "Reports tests", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(8);
        for (let i = 0; i < 6; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment(riskType[i], stakeholdersList);
            applicationsList[i].verifyStatus("assessment", "Completed");

            // Perform application review
            applicationsList[i].perform_review(riskType[i]);
            applicationsList[i].verifyStatus("review", "Completed");
        }
    });

    it("Number of Application risk validation", function () {
        Reports.open();
        Reports.verifyRisk(
            highRiskApps,
            mediumRiskApps,
            lowRiskApps,
            unknownRiskApps,
            totalApplications
        );
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(applicationsList);
    });
});
