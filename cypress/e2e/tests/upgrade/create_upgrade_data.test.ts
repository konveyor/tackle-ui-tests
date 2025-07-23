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

import * as data from "../../../utils/data_utils";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateMtaVersionInCLI,
    validateMtaVersionInUI,
} from "../../../utils/utils";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { CredentialsMaven } from "../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { User } from "../../models/keycloak/users/user";
import { UserAdmin } from "../../models/keycloak/users/userAdmin";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { Archetype } from "../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../models/migration/controls/businessservices";
import { Jobfunctions } from "../../models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { TagCategory } from "../../models/migration/controls/tagcategory";
import { Tag } from "../../models/migration/controls/tags";
import {
    cloudReadinessFilePath,
    cloudReadinessQuestionnaire,
    CredentialType,
    legacyPathfinder,
    SEC,
    UserCredentials,
} from "../../types/constants";
import { UpgradeData } from "../../types/types";

describe(["@pre-upgrade"], "Creating pre-requisites before an upgrade", () => {
    let mavenCredentialsUsername: CredentialsMaven;
    let sourceControlUsernameCredentials: CredentialsSourceControlUsername;
    let stakeHolder: Stakeholders;
    let archetype: Archetype;
    let stakeHolderGroup: Stakeholdergroups;
    const expectedMtaVersion = Cypress.env("mtaVersion");

    before("Login", function () {
        login();
        cy.visit("/");
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

    // Enable fail fast, skip the rest of tests if this specific test fails.
    it("Validate MTA version in UI", { failFast: { enabled: true } }, () =>
        validateMtaVersionInUI(expectedMtaVersion)
    );

    it("Validate MTA version in CLI", () => validateMtaVersionInCLI(expectedMtaVersion));

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
        stakeHolderGroup = new Stakeholdergroups(stakeHolderGroupName);
        stakeHolder = new Stakeholders("test@gmail.com", stakeHolderName, jobFunctionName, [
            stakeHolderGroupName,
        ]);
        const businessService = new BusinessServices(businessServiceName);
        const tagType = new TagCategory(tagTypeName, data.getColor());
        const tag = new Tag(tagName, tagTypeName);

        jobFunction.create();
        stakeHolderGroup.create();
        stakeHolder.create();
        businessService.create();
        tagType.create();
        tag.create();
    });

    it("Creating and assess archetype", function () {
        const { tagName, archetypeName } = this.upgradeData;
        archetype = new Archetype(
            archetypeName,
            ["EJB XML", "Servlet"],
            [tagName],
            null,
            [stakeHolder],
            [stakeHolderGroup]
        );
        archetype.create();
        archetype.perform_assessment("low", [stakeHolder], [stakeHolderGroup]);
        archetype.validateAssessmentField("Low");
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
        const { tagName } = this.upgradeData;
        const sourceApplication = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        sourceApplication.name = this.upgradeData.sourceApplicationName;
        sourceApplication.tags = [tagName];
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

    it("Import questionnaire and assess application", function () {
        AssessmentQuestionnaire.disable(legacyPathfinder);
        AssessmentQuestionnaire.import(cloudReadinessFilePath);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);

        const application = new Analysis(
            getRandomApplicationData(),
            getRandomAnalysisData(this.analysisData)
        );
        application.name = this.upgradeData.importedQuestionnaireAppName;
        application.create();
        application.perform_assessment(
            "medium",
            [stakeHolder],
            [stakeHolderGroup],
            cloudReadinessQuestionnaire
        );

        application.verifyStatus("assessment", "Completed");
        AssessmentQuestionnaire.enable(legacyPathfinder);
        AssessmentQuestionnaire.disable(cloudReadinessQuestionnaire);
    });

    it("Create new admin user to use after upgrade", function () {
        const user = this.upgradeData.adminUser;
        const password = Cypress.env("pass");
        const userAdmin = new UserAdmin(getRandomUserData());
        userAdmin.username = this.upgradeData.adminUser;
        userAdmin.password = Cypress.env("pass");

        //Logging in as keycloak admin to create new user
        User.loginKeycloakAdmin();
        userAdmin.create();
    });
});
