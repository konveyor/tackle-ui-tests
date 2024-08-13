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
    patchTackleCR,
    exists,
    expandRowDetails,
    getRandomAnalysisData,
    getRandomApplicationData,
    isEnabled,
    login,
    validateTackleCr,
    getCommandOutput,
    getNamespace,
    validateMtaVersionInUI,
    validateMtaVersionInCLI,
    isRwxEnabled,
    validateMtaOperatorLog,
} from "../../../utils/utils";
import { UpgradeData } from "../../types/types";
import { Credentials } from "../../models/administration/credentials/credentials";
import { Jobfunctions } from "../../models/migration/controls/jobfunctions";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../models/migration/controls/stakeholdergroups";
import { BusinessServices } from "../../models/migration/controls/businessservices";
import { TagCategory } from "../../models/migration/controls/tagcategory";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { MavenConfiguration } from "../../models/administration/repositories/maven";
import { clearRepository } from "../../views/repository.view";
import { stakeHoldersTable } from "../../views/stakeholders.view";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { cloudReadinessQuestionnaire, legacyPathfinder } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";
import { Archetype } from "../../models/migration/archetypes/archetype";

describe(["@post-upgrade"], "Performing post-upgrade validations", () => {
    const expectedMtaVersion = Cypress.env("mtaVersion");
    before("Login", function () {
        // Perform login
        login();
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
    });

    // Enable fail fast, skip the rest of tests if this specific test fails.
    it("Validate MTA version in UI", { failFast: { enabled: true } }, () =>
        validateMtaVersionInUI(expectedMtaVersion)
    );

    it("Validate MTA version in CLI", () => validateMtaVersionInCLI(expectedMtaVersion));

    it("Validate Tackle CR", () => validateTackleCr());

    it("Validate MTA Operator Log", () => validateMtaOperatorLog());

    it("Controls - testing existence of instances created before upgrade", function () {
        const {
            sourceControlUsernameCredentialsName,
            mavenUsernameCredentialName,
            jobFunctionName,
            stakeHolderGroupName,
            stakeHolderName,
            businessServiceName,
            tagTypeName,
            tagName,
        } = this.upgradeData;

        Credentials.openList();
        exists(sourceControlUsernameCredentialsName);
        exists(mavenUsernameCredentialName);

        Stakeholders.openList();
        exists(stakeHolderName, stakeHoldersTable);

        Stakeholdergroups.openList();
        exists(stakeHolderGroupName);

        Jobfunctions.openList();
        exists(jobFunctionName);

        BusinessServices.openList();
        exists(businessServiceName);

        TagCategory.openList();
        exists(tagTypeName);

        expandRowDetails(tagTypeName);
        exists(tagName);
    });

    it("Archetype - testing existence of instance created before upgrade", function () {
        const { archetypeName } = this.upgradeData;
        Archetype.open();
        exists(archetypeName);
    });

    it("Applications - testing existence of instances created before upgrade", function () {
        const { sourceApplicationName, binaryApplicationName, uploadBinaryApplicationName } =
            this.upgradeData;

        const sourceApplication = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        sourceApplication.name = sourceApplicationName;

        const binaryApplication = new Analysis(
            getRandomApplicationData("tackletestApp_binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );
        binaryApplication.name = binaryApplicationName;

        const uploadBinaryApplication = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        uploadBinaryApplication.name = uploadBinaryApplicationName;

        Analysis.open();
        exists(sourceApplicationName);
        exists(binaryApplicationName);
        exists(uploadBinaryApplicationName);

        uploadBinaryApplication.analyze();
        uploadBinaryApplication.verifyAnalysisStatus("Completed");
        uploadBinaryApplication.selectApplication();

        binaryApplication.analyze();
        binaryApplication.verifyAnalysisStatus("Completed");
        binaryApplication.selectApplication();

        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");
        sourceApplication.selectApplication();
    });

    it("Verify that assessed application is migrated", function () {
        const assessmentApplication = new Application({
            name: this.upgradeData.assessmentApplicationName,
        });
        assessmentApplication.verifyStatus("assessment", "Completed");
    });

    it("Verify that imported questionnaire assessement is migrated", function () {
        AssessmentQuestionnaire.disable(legacyPathfinder);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        const assessmentApplication = new Application({
            name: this.upgradeData.importedQuestionnaireAppName,
        });
        assessmentApplication.verifyStatus("assessment", "Completed");
        assessmentApplication.validateAssessmentField("Medium");
        AssessmentQuestionnaire.disable(cloudReadinessQuestionnaire);
        AssessmentQuestionnaire.enable(legacyPathfinder);
    });

    it("Validating pods after upgrade", function () {
        const allowedPodsList = [
            "keycloak-0",
            "mta-hub",
            "mta-keycloak-postgresql",
            "mta-operator",
            "mta-ui",
            "rhsso-operator",
        ];
        getCommandOutput(`oc get pods -n${getNamespace()}`).then((result) => {
            allowedPodsList.forEach((podName) => {
                expect(result.stdout).contains(podName);
            });
            expect(result.stdout).not.contain("pathfinder");
        });
    });

    it("Enabling RWX, validating it works, disabling it", function () {
        MavenConfiguration.open();
        isRwxEnabled().then((rwxEnabled) => {
            expect(rwxEnabled).to.be.false;
            isEnabled(clearRepository, rwxEnabled);
            rwxEnabled = true;
            patchTackleCR("configureRWX", rwxEnabled);
            isEnabled(clearRepository, rwxEnabled);

            rwxEnabled = false;
            patchTackleCR("configureRWX", rwxEnabled);
            isEnabled(clearRepository, rwxEnabled);
        });
    });
});
