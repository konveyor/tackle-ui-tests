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
    createMultipleStakeholders,
    createMultipleApplications,
    deleteByList,
    deleteApplicationTableRows,
} from "../../../../utils/utils";
import { legacyPathfinder } from "../../../types/constants";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Application } from "../../../models/migration/applicationinventory/application";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";

let stakeholdersList: Array<Stakeholders> = [];
let applicationsList: Array<Application> = [];
const totalApplications = "8";
const highRiskApps = 3;
const mediumRiskApps = 1;
const lowRiskApps = 2;
const unknownRiskApps = 2;

describe(["@tier2"], "Application risks tests", () => {
    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.deleteAllQuesionnaire();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        deleteApplicationTableRows();
        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(5);
        for (let i = 0; i < highRiskApps; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment("high", stakeholdersList);
            applicationsList[i].verifyStatus("assessment", "Completed");

            // Perform application review
            applicationsList[i].perform_review("high");
            applicationsList[i].verifyStatus("review", "Completed");
        }

        for (let i = 0; i < mediumRiskApps; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment("medium", stakeholdersList);
            applicationsList[i].verifyStatus("assessment", "Completed");

            // Perform application review
            applicationsList[i].perform_review("medium");
            applicationsList[i].verifyStatus("review", "Completed");
        }

        for (let i = 0; i < lowRiskApps; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment("low", stakeholdersList);
            applicationsList[i].verifyStatus("assessment", "Completed");

            // Perform application review
            applicationsList[i].perform_review("low");
            applicationsList[i].verifyStatus("review", "Completed");
        }
    });

    it("Application risk validation", function () {
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
