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
    configureRWX,
    exists,
    expandRowDetails,
    getRandomAnalysisData,
    getRandomApplicationData,
    isEnabled,
    login,
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

describe(["@post-upgrade"], "Performing post-upgrade validations", () => {
    before("Login", function () {
        // Perform login
        login();
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
        exists(stakeHolderName);

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
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        uploadBinaryApplication.name = uploadBinaryApplicationName;

        Analysis.open();
        exists(sourceApplicationName);
        exists(binaryApplicationName);
        exists(uploadBinaryApplicationName);

        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");

        binaryApplication.analyze();
        binaryApplication.verifyAnalysisStatus("Completed");

        uploadBinaryApplication.analyze();
        uploadBinaryApplication.verifyAnalysisStatus("Completed");
    });

    it("Enabling RWX, validating it works, disabling it", function () {
        MavenConfiguration.open();
        let rwxEnabled = false;
        isEnabled(clearRepository, rwxEnabled);

        rwxEnabled = true;
        configureRWX(rwxEnabled);
        isEnabled(clearRepository, rwxEnabled);

        rwxEnabled = false;
        configureRWX(rwxEnabled);
        isEnabled(clearRepository, rwxEnabled);
    });
});
