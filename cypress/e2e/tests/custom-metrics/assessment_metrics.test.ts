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
    deleteByList,
    login,
} from "../../../utils/utils";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../models/migration/applicationinventory/application";
const metrics = new Metrics();
const metricName = "konveyor_assessments_initiated_total";
let applicationList: Array<Application> = [];
let stakeholdersList: Array<Stakeholders> = [];
let counter: number;
const fileName = "Legacy Pathfinder";

describe(["@tier2"], "Custom Metrics - The total number of initiated assessments", function () {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Navigate to stakeholders control tab and create new stakeholder
        stakeholdersList = createMultipleStakeholders(1);

        // Create 2 applications
        applicationList = createMultipleApplications(2);
        AssessmentQuestionnaire.enable(fileName);
    });

    beforeEach("Get the current counter value", function () {
        metrics.getValue(metricName).then((counterValue) => {
            counter = counterValue;
        });
    });

    it("Perform Assessment-Validate metrics assessment count increased", function () {
        // Perform assessment of application
        for (let i = 0; i < applicationList.length; i++) {
            applicationList[i].perform_assessment("low", [stakeholdersList[0].name]);
            cy.wait(2000);
            applicationList[i].verifyStatus("assessment", "Completed");
            counter++;
        }

        // Validate the assessment initiated count increased
        metrics.validateMetric(metricName, counter);
    });

    it("Perform Review-No impact on assessment count", function () {
        // Perform application review
        applicationList[1].perform_review("medium");
        cy.wait(2000);
        applicationList[1].verifyStatus("review", "Completed");

        // Validate the assessment initiated count doesn't change
        metrics.validateMetric(metricName, counter);
    });

    it("Discard Assessment-Validate metrics assessment count doesn't change ", function () {
        // Discard assessment of application
        applicationList[0].verifyStatus("assessment", "Completed");
        applicationList[0].selectKebabMenuItem("Discard assessment(s)");

        // Validate the assessment initiated count doesn't change
        metrics.validateMetric(metricName, counter);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(applicationList);
    });
});
