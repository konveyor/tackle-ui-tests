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
    preservecookies,
} from "../../../utils/utils";
import { TagCategory } from "../../models/migration/controls/tagcategory";
import * as data from "../../../utils/data_utils";
import { Tag } from "../../models/migration/controls/tags";
import { CredentialType, SEC, UserCredentials } from "../../types/constants";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Jobfunctions } from "../../models/migration/controls/jobfunctions";
import { BusinessServices } from "../../models/migration/controls/businessservices";
import { Stakeholdergroups } from "../../models/migration/controls/stakeholdergroups";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../utils/data_utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { UpgradeData } from "../../types/types";
import { CredentialsMaven } from "../../models/administration/credentials/credentialsMaven";

describe(["@pre-upgrade"], "Creating pre-requisites before an upgrade", () => {
    let mavenCredentialsUsername: CredentialsMaven;
    let sourceControlUsernameCredentials: CredentialsSourceControlUsername;

    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

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
        // Defining stakeholder groups
        const stakeHolderGroup = new Stakeholdergroups(stakeHolderGroupName);
        // Defining stakeholders
        const stakeHolder = new Stakeholders("test@gmail.com", stakeHolderName, jobFunctionName, [
            stakeHolderGroupName,
        ]);
        // Defining business Service
        const businessService = new BusinessServices(businessServiceName);
        // Defining tag category
        const tagType = new TagCategory(tagTypeName, data.getColor(), data.getRandomNumber(5, 15));
        // Defining tag
        const tag = new Tag(tagName, tagTypeName);

        jobFunction.create();
        stakeHolderGroup.create();
        stakeHolder.create();
        businessService.create();
        tagType.create();
        tag.create();
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
        cy.wait(2 * SEC);
        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");
    });

    it("Creating Upload Binary Analysis", function () {
        const uploadBinaryApplication = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        uploadBinaryApplication.name = this.upgradeData.uploadBinaryApplicationName;
        uploadBinaryApplication.create();
        cy.wait(2 * SEC);
        // No credentials required for uploaded binary.
        uploadBinaryApplication.analyze();
        uploadBinaryApplication.verifyAnalysisStatus("Completed");
    });

    it("Binary Analysis", function () {
        // For binary analysis application must have group,artifact and version.
        const binaryApplication = new Analysis(
            getRandomApplicationData("tackletestApp_binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["binary_analysis_on_tackletestapp"])
        );
        binaryApplication.name = this.upgradeData.binaryApplicationName;
        binaryApplication.create();
        cy.wait(2 * SEC);
        // Both source and maven credentials required for binary.
        binaryApplication.manageCredentials(
            sourceControlUsernameCredentials.name,
            mavenCredentialsUsername.name
        );
        binaryApplication.analyze();
        binaryApplication.verifyAnalysisStatus("Completed");
    });
});
