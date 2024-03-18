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
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateUiVersion,
} from "../../../utils/utils";
import { TagCategory } from "../../models/migration/controls/tagcategory";
import * as data from "../../../utils/data_utils";
import { Tag } from "../../models/migration/controls/tags";
import { CredentialType, legacyPathfinder, SEC, UserCredentials } from "../../types/constants";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Jobfunctions } from "../../models/migration/controls/jobfunctions";
import { BusinessServices } from "../../models/migration/controls/businessservices";
import { Stakeholdergroups } from "../../models/migration/controls/stakeholdergroups";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../utils/data_utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { UpgradeData } from "../../types/types";
import { CredentialsMaven } from "../../models/administration/credentials/credentialsMaven";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";

describe(["@pre-upgrade"], "Creating pre-requisites before an upgrade", () => {
    let mavenCredentialsUsername: CredentialsMaven;
    let sourceControlUsernameCredentials: CredentialsSourceControlUsername;
    let stakeHolder: Stakeholders;
    const expectedMtaVersion = Cypress.env("sourceMtaVersion");

    before("Login", function () {
        login();
        validateUiVersion(expectedMtaVersion);
        AssessmentQuestionnaire.enable(legacyPathfinder);
    });

    beforeEach("Persist session", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
        cy.fixture("upgrade-data").then((upgradeData: UpgradeData) => {
            this.upgradeData = upgradeData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Creating credentials", function () {
        const { sourceControlUsernameCredentialsName, mavenUsernameCredentialName } =
            this.upgradeData;
        sourceControlUsernameCredentials = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        sourceControlUsernameCredentials.name = sourceControlUsernameCredentialsName;
        sourceControlUsernameCredentials.create();

        mavenCredentialsUsername = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        mavenCredentialsUsername.name = mavenUsernameCredentialName;
        mavenCredentialsUsername.create();
    });

    it("Creating Controls instances", function () {
        const {
            jobFunctionName,
            stakeHolderGroupName,
            stakeHolderName,
            businessServiceName,
            tagTypeName,
            tagName,
        } = this.upgradeData;
        const jobFunction = new Jobfunctions(jobFunctionName);
        const stakeHolderGroup = new Stakeholdergroups(stakeHolderGroupName);
        stakeHolder = new Stakeholders("test@gmail.com", stakeHolderName, jobFunctionName, [
            stakeHolderGroupName,
        ]);
        const businessService = new BusinessServices(businessServiceName);
        const tagType = new TagCategory(tagTypeName, data.getColor(), data.getRandomNumber(5, 15));
        const tag = new Tag(tagName, tagTypeName);

        jobFunction.create();
        stakeHolderGroup.create();
        stakeHolder.create();
        businessService.create();
        tagType.create();
        tag.create();
    });

    it("Creating Upload Binary Analysis", function () {
        const uploadBinaryApplication = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        uploadBinaryApplication.name = this.upgradeData.uploadBinaryApplicationName;
        uploadBinaryApplication.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        uploadBinaryApplication.perform_assessment("low", [stakeHolder]);
        uploadBinaryApplication.analyze();
        uploadBinaryApplication.verifyAnalysisStatus("Completed");
        uploadBinaryApplication.verifyStatus("assessment", "Completed");
        uploadBinaryApplication.selectApplication();
    });

    it("Creating source applications", function () {
        const sourceApplication = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        sourceApplication.name = this.upgradeData.sourceApplicationName;
        sourceApplication.create();
        sourceApplication.perform_assessment("low", [stakeHolder]);
        sourceApplication.verifyStatus("assessment", "Completed");
        cy.wait(2 * SEC);
        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");
        sourceApplication.selectApplication();
    });

    it("Binary Analysis", function () {
        const binaryApplication = new Analysis(
            getRandomApplicationData("tackletestApp_binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );
        binaryApplication.name = this.upgradeData.binaryApplicationName;
        binaryApplication.create();
        cy.wait(2 * SEC);
        binaryApplication.manageCredentials(
            sourceControlUsernameCredentials.name,
            mavenCredentialsUsername.name
        );
        binaryApplication.perform_assessment("low", [stakeHolder]);
        binaryApplication.analyze();
        binaryApplication.verifyAnalysisStatus("Completed");
        binaryApplication.verifyStatus("assessment", "Completed");
        binaryApplication.selectApplication();
    });

    it("Assess application", function () {
        const assessmentApplication = new Analysis(
            getRandomApplicationData("tackletestApp_binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );
        assessmentApplication.name = this.upgradeData.assessmentApplicationName;
        assessmentApplication.create();
        assessmentApplication.perform_assessment("low", [stakeHolder]);
        assessmentApplication.verifyStatus("assessment", "Completed");
    });
});
