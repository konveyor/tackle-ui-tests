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
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../utils/utils";
import { TagType } from "../../models/developer/controls/tagtypes";
import * as data from "../../../utils/data_utils";
import { Tag } from "../../models/developer/controls/tags";
import { CredentialType, SEC, UserCredentials } from "../../types/constants";
import { Stakeholders } from "../../models/developer/controls/stakeholders";
import { Jobfunctions } from "../../models/developer/controls/jobfunctions";
import { BusinessServices } from "../../models/developer/controls/businessservices";
import { Stakeholdergroups } from "../../models/developer/controls/stakeholdergroups";
import { CredentialsSourceControlUsername } from "../../models/administrator/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../utils/data_utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { UpgradeData } from "../../types/types";
import { CredentialsMaven } from "../../models/administrator/credentials/credentialsMaven";

describe("Creating pre-requisites before an upgrade", { tags: "@upgrade" }, () => {
    // let source_credential;
    let mavenCredsUsername: CredentialsMaven;
    let sourceControlUsernameCredentials: CredentialsSourceControlUsername;

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

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

    it("Creating credentials", { tags: "@upgrade" }, function () {
        const { sourceControlUsernameCredentialsName, mavenUsernameCredentialName } =
            this.upgradeData;
        sourceControlUsernameCredentials = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );
        sourceControlUsernameCredentials.name = sourceControlUsernameCredentialsName;
        sourceControlUsernameCredentials.create();

        mavenCredsUsername = new CredentialsMaven(getRandomCredentialsData(CredentialType.maven));
        mavenCredsUsername.name = mavenUsernameCredentialName;
        mavenCredsUsername.create();
    });

    it("Creating Controls instances", { tags: "@upgrade" }, function () {
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
        // Defining tag type
        const tagType = new TagType(tagTypeName, data.getColor(), data.getRandomNumber(5, 15));
        // Defining tag
        const tag = new Tag(tagName, tagTypeName);

        jobFunction.create();
        stakeHolderGroup.create();
        stakeHolder.create();
        businessService.create();
        tagType.create();
        tag.create();
    });

    it("Creating source applications", { tags: "@upgrade" }, function () {
        const sourceApplication = new Analysis(
            getRandomApplicationData("bookServerApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        sourceApplication.create();
        // cy.wait("@getApplication");
        cy.wait(2 * SEC);
        sourceApplication.analyze();
    });

    it("Creating Upload Binary Analysis", function () {
        const uploadBinaryApplication = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[4])
        );
        uploadBinaryApplication.create();
        cy.wait(2 * SEC);
        // No credentials required for uploaded binary.
        uploadBinaryApplication.analyze();
    });

    it("Binary Analysis", function () {
        // For binary analysis application must have group,artifcat and version.
        const application = new Analysis(
            getRandomApplicationData("tackletestApp_binary", { binaryData: this.appData[2] }),
            getRandomAnalysisData(this.analysisData[3])
        );
        application.create();
        cy.wait(2 * SEC);
        // Both source and maven credentials required for binary.
        application.manageCredentials(
            sourceControlUsernameCredentials.name,
            mavenCredsUsername.name
        );
        application.analyze();
    });
});
