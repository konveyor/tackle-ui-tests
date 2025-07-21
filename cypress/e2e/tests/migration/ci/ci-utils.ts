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

import * as data from "../../../../utils/data_utils";
import {
    checkSuccessAlert,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    exists,
    getApplicationID,
    getRandomAnalysisData,
    getRandomApplicationData,
    notExists,
    seedAnalysisData,
} from "../../../../utils/utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../../models/migration/controls/businessservices";
import { Jobfunctions } from "../../../models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Tag } from "../../../models/migration/controls/tags";
import { infoAlertMessage, successAlertMessage } from "../../../views/common.view";

import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { legacyPathfinder } from "../../../types/constants";

let stakeholders: Stakeholders[];
let stakeholderGroups: Stakeholdergroups[];
let tags: Tag[];

export function businessServiceCRUD() {
    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/businessservices*").as("postBusinessService");
        cy.intercept("GET", "/hub/businessservices*").as("getBusinessService");

        cy.intercept("POST", "/hub/stakeholders*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholders*").as("getStakeholders");
    });

    it("Business service CRUD", function () {
        const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());
        businessService.create();
        cy.wait("@postBusinessService");
        exists(businessService.name);

        let updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        cy.wait("@getBusinessService");
        exists(updatedBusinessServiceName);

        businessService.delete();
        cy.wait("@getBusinessService");
        notExists(businessService.name);
    });
}

export function jobFunctionCRUD() {
    it("Jobfunction CRUD", function () {
        const jobfunction = new Jobfunctions(data.getJobTitle());
        jobfunction.create();
        exists(jobfunction.name);

        const updatedJobfuncName = data.getJobTitle();
        jobfunction.edit(updatedJobfuncName);
        exists(updatedJobfuncName);

        jobfunction.delete();
        notExists(jobfunction.name);
    });
}

export function archetypeCRUD() {
    it("Archetype CRUD operations", function () {
        // Automates Polarion MTA-395
        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        tags = createMultipleTags(2);
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders,
            stakeholderGroups
        );
        archetype.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype ${archetype.name} was successfully created.`,
            true
        );
        exists(archetype.name);

        const updatedArchetypeName = data.getRandomWord(8);
        archetype.edit({ name: updatedArchetypeName });
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype was successfully saved.`,
            true
        );
        exists(updatedArchetypeName);

        archetype.delete();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype ${archetype.name} was successfully deleted.`,
            true
        );
        notExists(archetype.name);

        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
    });
}

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
