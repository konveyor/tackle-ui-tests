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
    applySearchFilter,
    clickByText,
    createMultipleApplicationsWithBSandTags,
    createMultipleBusinessServices,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    exists,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    notExists,
    selectFilter,
} from "../../../../../utils/utils";
import {
    analysis,
    AnalysisStatuses,
    archetypes,
    artifact,
    button,
    clearAllFilters,
    CredentialType,
    credentialType,
    git,
    name,
    repositoryType,
    risk,
    subversion,
    tags,
    UserCredentials,
} from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import * as commonView from "../../../../views/common.view";
import { filterDropDownContainer, standardFilter } from "../../../../views/common.view";
import { searchMenuToggle } from "../../../../views/issue.view";

let source_credential;
let maven_credential;
let applicationsList: Array<Application> = [];
let businessServicesList: Array<BusinessServices> = [];
let tagList: Array<Tag> = [];
let stakeholders: Array<Stakeholders> = [];
const fileName = "Legacy Pathfinder";

describe(["@tier3"], "Application inventory filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");

        let businessServicesList = createMultipleBusinessServices(2);
        stakeholders = createMultipleStakeholders(1);

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(fileName);

        let tagList = createMultipleTags(2);
        applicationsList = createMultipleApplicationsWithBSandTags(
            2,
            businessServicesList,
            tagList,
            null
        );

        // Create source Credentials
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();

        // Create Maven credentials
        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        maven_credential.create();
    });

    beforeEach("Load Fixtures & Interceptors", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
        Application.open(true);

        clearAllFiltersIfExists();
    });

    it("Name filter validations", function () {
        Application.open();
        filterApplicationsBySubstring();

        // Enter an exact existing name and assert
        applySearchFilter(name, applicationsList[1].name);
        exists(applicationsList[1].name);
        notExists(applicationsList[0].name);
        clickByText(button, clearAllFilters);
    });

    it("Business service filter validations", function () {
        const validSearchInput = applicationsList[0].business;
        applySearchFilter("Business service", validSearchInput);

        exists(applicationsList[0].business);
        clickByText(button, clearAllFilters);
    });

    it("Tag filter validations", function () {
        Application.open();

        const validSearchInput = applicationsList[0].tags[0];
        applySearchFilter(tags, validSearchInput);

        exists(applicationsList[0].name);
        notExists(applicationsList[1].name);
        clickByText(button, clearAllFilters);

        applySearchFilter(tags, applicationsList[1].tags[0]);
        exists(applicationsList[1].name);
        notExists(applicationsList[0].name);
        clickByText(button, clearAllFilters);
    });

    it("Credential type filter validations", function () {
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source_Binary", {
                sourceData: this.appData["tackle-testapp"],
                binaryData: this.appData["tackle-testapp-binary"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_tackletestapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");

        application.manageCredentials(null, maven_credential.name);
        exists(application.name);

        applySearchFilter(credentialType, "Maven");
        exists(application.name);
        clickByText(button, clearAllFilters);

        application.manageCredentials(source_credential.name, null);
        exists(application.name);

        applySearchFilter(credentialType, "Source");
        exists(application.name);
        clickByText(button, clearAllFilters);
    });

    it("Repository type filter validations", function () {
        // For application must have source code URL
        const application = new Application(
            getRandomApplicationData("tackleTestApp_Source", {
                sourceData: this.appData["tackle-testapp-git"],
            })
        );
        const application1 = new Application(
            getRandomApplicationData("tackleTestApp_svnRepo", {
                sourceData: this.appData["tackle-testapp-svn"],
            })
        );

        //Create two applications one with Git and another with svn as repository type
        application.create();
        application1.create();
        cy.get("@getApplication");

        // Apply repository type filter check with Git
        // Check Application exists and application1 doesn't exist
        applySearchFilter(repositoryType, git);
        exists(application.name);
        notExists(application1.name);
        clickByText(button, clearAllFilters);

        // Apply repository type filter check with Subversion
        // Check Application1 exists and application doesn't exist
        applySearchFilter(repositoryType, subversion);
        exists(application1.name);
        notExists(application.name);
        clickByText(button, clearAllFilters);
    });

    it("Artifact type filter validations", function () {
        // For application must have Binary group,artifact and version
        const application = new Application(
            getRandomApplicationData("tackleTestApp_Binary", {
                binaryData: this.appData["tackle-testapp-binary"],
            })
        );
        application.create();
        cy.get("@getApplication");

        // Check application exists on the page
        exists(application.name);

        // Apply artifact filter check with associated artifact field
        // Check application exists and applicationList[0] doesn't exist
        applySearchFilter(artifact, "Associated artifact");
        exists(application.name);
        notExists(applicationsList[0].name);
        clickByText(button, clearAllFilters);

        // Apply artifact filter check with 'No associated artifact' field
        // Check applicationList[0] exists and application doesn't exist
        applySearchFilter(artifact, "No associated artifact");
        exists(applicationsList[0].name);
        notExists(application.name);
        clickByText(button, clearAllFilters);
    });

    it("Risk filter validations", function () {
        const application = applicationsList[0];
        const application1 = applicationsList[1];

        // Check application exists on the page
        exists(application.name);
        exists(application1.name);

        application.perform_assessment("low", stakeholders);
        application.verifyStatus("assessment", "Completed");

        // Apply search filter Risk - Low
        applySearchFilter(risk, "Low");
        exists(application.name);
        notExists(application1.name);
        clickByText(button, clearAllFilters);

        // apply search filter Risk - Unassessed
        applySearchFilter(risk, "Unassessed");
        exists(application1.name);
        notExists(application.name);
        clickByText(button, clearAllFilters);
    });

    it("Archetype filter validations", function () {
        const tags = createMultipleTags(2);

        //validate archetype1 is shown in applications archetype filter and application1 is present
        const archetype1 = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null
        );
        archetype1.create();
        const appdata = {
            name: data.getAppName(),
            description: data.getDescription(),
            tags: [tags[0].name],
            comment: data.getDescription(),
        };
        const application1 = new Application(appdata);
        applicationsList.push(application1);
        application1.create();
        cy.get("@getApplication");
        const validSearchInput = archetype1.name;
        applySearchFilter("Archetypes", validSearchInput);
        exists(application1.name);
        clickByText(button, clearAllFilters);

        //validate archetype2 is not present in applications archetype filter
        const archetype2 = new Archetype(
            data.getRandomWord(8),
            [tags[1].name],
            [tags[0].name],
            null
        );
        archetype2.create();
        Application.open();
        selectFilter(archetypes);
        cy.get(filterDropDownContainer).find(searchMenuToggle).click();
        notExists(archetype2.name);

        deleteByList([archetype1, archetype2]);
        deleteByList(tags);
    });

    it("Analysis status filter validation", function () {
        const application1 = new Analysis(
            getRandomApplicationData("tackle_test_app_1", {
                sourceData: this.appData["tackle-testapp-public"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application1.create();
        applicationsList.push(application1);

        const application2 = new Analysis(
            getRandomApplicationData("python-app-custom-rules", {
                sourceData: this.appData["python-demo-app"],
            }),
            getRandomAnalysisData(this.analysisData["python_demo_application"])
        );

        application2.create();
        applicationsList.push(application2);

        const application3 = new Analysis(
            getRandomApplicationData("tackle_test_app_2", {
                sourceData: this.appData["tackle-testapp"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application3.create();
        applicationsList.push(application3);

        application1.analyze();
        application1.verifyAnalysisStatus(AnalysisStatuses.completed);

        application3.analyze();
        application3.verifyAnalysisStatus(AnalysisStatuses.failed);

        applySearchFilter(analysis, AnalysisStatuses.notStarted);
        exists(application2.name);
        notExists(application3.name);
        notExists(application1.name);

        clickByText(button, clearAllFilters);

        applySearchFilter(analysis, AnalysisStatuses.completed);
        exists(application1.name);
        notExists(application3.name);
        notExists(application2.name);

        clickByText(button, clearAllFilters);

        applySearchFilter(analysis, AnalysisStatuses.failed);
        exists(application3.name);
        notExists(application2.name);
        notExists(application1.name);
    });

    after("Perform test data clean up", function () {
        deleteByList(tagList);
        deleteByList(businessServicesList);
        deleteByList(applicationsList);
        deleteByList(stakeholders);
    });
});
const clearAllFiltersIfExists = (): void => {
    cy.get("body").then(($body) => {
        if ($body.find('button:contains("Clear all filters")').length > 0) {
            cy.contains(button, "Clear all filters").click({ force: true });
        }
    });
};

const filterApplicationsBySubstring = (): void => {
    const [firstAppSubstring, secondAppSubstring] = applicationsList.map((app) =>
        app.name.substring(0, 12)
    );
    selectFilter(name);
    if (firstAppSubstring === secondAppSubstring) {
        cy.get(commonView.inputText)
            .click()
            .focused()
            .clear()
            .type(firstAppSubstring)
            .then(() => {
                [applicationsList[0].name, applicationsList[1].name].forEach((substring) => {
                    cy.get(standardFilter).contains(substring).click();
                });
                exists(applicationsList[0].name);
                exists(applicationsList[1].name);
            });
    } else {
        applySearchFilter(name, firstAppSubstring);
        exists(applicationsList[0].name);
        notExists(applicationsList[1].name);
    }

    clickByText(button, clearAllFilters);
};
