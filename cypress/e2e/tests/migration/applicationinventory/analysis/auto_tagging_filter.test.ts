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
    deleteByList,
    login,
    getRandomApplicationData,
    getRandomAnalysisData,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Tag } from "../../../../models/migration/controls/tags";
import { TagCategory } from "../../../../models/migration/controls/tagcategory";
import { applicationTag } from "../../../../views/applicationinventory.view";
import { SEC } from "../../../../types/constants";
let source_credential;
var applicationsList: Array<Analysis> = [];
let tagCategory;
let tag;

describe(["@tier1"], "Source Analysis", () => {
    before("Login", function () {
        login();
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();

        tagCategory = new TagCategory(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagCategory.create();

        tag = new Tag(data.getRandomWord(6), tagCategory.name);
        tag.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
            this.techTags = analysisData["analysis_for_enableTagging"]["techTags"];
        });
    });

    it("Apply search filter:Analysis on app details page", function () {
        // Automates Polarion MTA-311
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source_autoTagging", [tag.name], {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        cy.wait(2000);

        application.filterTags("Analysis");
        application.tagAndCategoryExists(this.techTags);
        cy.get(applicationTag).should("not.contain", tag.name);
        application.closeApplicationDetails();
        application.delete();
    });

    it("Apply search filter:Manual on app details page", function () {
        // Automates Polarion MTA-310
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source_autoTagging", [tag.name], {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        cy.wait(2000);

        application.filterTags("Manual");
        cy.get(applicationTag).should("contain", tag.name);
        for (var tagIndex = 0; tagIndex < this.techTags.length; tagIndex++) {
            cy.get(applicationTag, { timeout: 10 * SEC }).should(
                "not.contain",
                this.techTags[tagIndex][1]
            );
            cy.get("div[class='pf-c-content'] > h4").should(
                "not.contain",
                this.techTags[tagIndex][0]
            );
        }
        application.closeApplicationDetails();
        application.delete();
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
        tag.delete();
        tagCategory.delete();
        source_credential.delete();
    });
});
