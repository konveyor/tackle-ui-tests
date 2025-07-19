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
    checkSuccessAlert,
    createMultipleStakeholders,
    deleteByList,
    getApplicationID,
    getRandomAnalysisData,
    getRandomApplicationData,
    seedAnalysisData,
} from "../../../../../utils/utils";

import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { legacyPathfinder } from "../../../../types/constants";
import { infoAlertMessage } from "../../../../views/common.view";

let stakeholders: Stakeholders[];
const yamlFile = "questionnaire_import/cloud-native.yaml";

export function assessReviewAndAnalyzeApplication() {
    beforeEach("Interceptors", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
        cy.visit("/");
    });

    it("Validate application assessment and review with low risk and analyze", function () {
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholders = createMultipleStakeholders(1);
        const application = new Analysis(
            getRandomApplicationData("ci_testApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["imported_data_for_ci_test"])
        );
        application.create();
        cy.wait("@getApplication");

        //Perform assessment of application
        application.perform_assessment("low", stakeholders);
        application.verifyStatus("assessment", "Completed");

        // Perform application review
        application.perform_review("low");
        application.verifyStatus("review", "Completed");
        application.validateReviewFields();

        application.analyze();
        checkSuccessAlert(infoAlertMessage, `Submitted for analysis`);

        application.selectApplicationRow();

        cy.url().then((currentUrl) => {
            const id = getApplicationID(currentUrl);
            cy.log(`Current URL: ${currentUrl}`);
            cy.log(`Extracted ID: ${id}`);
            seedAnalysisData(id);
        });
        application.verifyEffort(this.analysisData["imported_data_for_ci_test"]["effort"]);
        application.validateIssues(this.analysisData["imported_data_for_ci_test"]["issues"]);
        application.delete();
        deleteByList(stakeholders);
    });
}
