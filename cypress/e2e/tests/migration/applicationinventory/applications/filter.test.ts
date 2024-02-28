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
    login,
    clickByText,
    exists,
    applySearchFilter,
    createMultipleBusinessServices,
    createMultipleTags,
    deleteByList,
    createMultipleApplicationsWithBSandTags,
    getRandomApplicationData,
    getRandomAnalysisData,
    notExists,
    createMultipleStakeholders,
    selectFilter,
} from "../../../../../utils/utils";
import {
    button,
    clearAllFilters,
    tag,
    CredentialType,
    UserCredentials,
    credentialType,
    repositoryType,
    subversion,
    git,
    artifact,
    name,
    risk,
    SEC,
} from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Tag } from "../../../../models/migration/controls/tags";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { filterDropDown, filterDropDownContainer } from "../../../../views/common.view";

let source_credential;
let maven_credential;
let applicationsList: Array<Application> = [];
let businessServicesList: Array<BusinessServices> = [];
let tagList: Array<Tag> = [];
let stakeholders: Array<Stakeholders> = [];
const fileName = "Legacy Pathfinder";

describe(["@tier2"], "Application inventory filter validations", function () {
    before("Login and Create Test Data", function () {
        login();

        //Create Multiple Application with Business service and Tags
        let businessServicesList = createMultipleBusinessServices(2);
        stakeholders = createMultipleStakeholders(1);

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
    });

    it("Name filter validations", function () {
        Application.open();

        // Enter an existing name substring and assert
        var validSearchInput = applicationsList[0].name.substring(0, 11);
        applySearchFilter(name, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].name);

        if (applicationsList[1].name.indexOf(validSearchInput) >= 0) {
            exists(applicationsList[1].name);
        }
        clickByText(button, clearAllFilters);

        // Enter an exact existing name and assert
        applySearchFilter(name, applicationsList[1].name);
        cy.wait(2000);
        exists(applicationsList[1].name);
        clickByText(button, clearAllFilters);
    });

    it("Business service filter validations", function () {
        const validSearchInput = applicationsList[0].business;
        applySearchFilter("Business service", validSearchInput);
        cy.wait(2000);

        exists(applicationsList[0].business);
        clickByText(button, clearAllFilters);
    });

    it("Tag filter validations", function () {
        Application.open();

        const validSearchInput = applicationsList[0].tags[0];
        applySearchFilter(tag, validSearchInput);
        cy.wait(2000);

        exists(applicationsList[0].name);
        notExists(applicationsList[1].name);
        clickByText(button, clearAllFilters);

        applySearchFilter(tag, applicationsList[1].tags[0]);
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
        cy.wait(2000);

        application.manageCredentials(null, maven_credential.name);
        exists(application.name);

        applySearchFilter(credentialType, "Maven");
        cy.wait(2000);
        exists(application.name);
        clickByText(button, clearAllFilters);

        application.manageCredentials(source_credential.name, null);
        exists(application.name);

        applySearchFilter(credentialType, "Source");
        cy.wait(2000);
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
        cy.wait(2000);

        // Apply repository type filter check with Git
        // Check Application exists and application1 doesn't exist
        applySearchFilter(repositoryType, git);
        cy.wait(2000);
        exists(application.name);
        notExists(application1.name);
        clickByText(button, clearAllFilters);

        // Apply repository type filter check with Subversion
        // Check Application1 exists and application doesn't exist
        applySearchFilter(repositoryType, subversion);
        cy.wait(2000);
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
        cy.wait(2000);

        // Check application exists on the page
        exists(application.name);

        // Apply artifact filter check with associated artifact field
        // Check application exists and applicationList[0] doesn't exist
        applySearchFilter(artifact, "Associated artifact");
        cy.wait(2000);
        exists(application.name);
        notExists(applicationsList[0].name);
        clickByText(button, clearAllFilters);

        // Apply artifact filter check with 'No associated artifact' field
        // Check applicationList[0] exists and application doesn't exist
        applySearchFilter(artifact, "No associated artifact");
        cy.wait(2000);
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
        cy.wait(2 * SEC);
        application.verifyStatus("assessment", "Completed");

        // Apply search filter Risk - Low
        applySearchFilter(risk, "Low");
        cy.wait(2 * SEC);
        exists(application.name);
        notExists(application1.name);
        clickByText(button, clearAllFilters);

        // apply search filter Risk - Unknown
        applySearchFilter(risk, "Unknown");
        cy.wait(2 * SEC);
        exists(application1.name);
        notExists(application.name);
        clickByText(button, clearAllFilters);
    });

    it("Bug MTA-2322: Archetype filter validations", function () {
        const tags = createMultipleTags(2);

        //validate archetype1 is shown in applications archetype filter and application1 is present
        const archetype1 = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null
        );
        archetype1.create();
        cy.wait(2 * SEC);
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
        cy.wait(2 * SEC);
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
        cy.wait(2 * SEC);
        Application.open();
        selectFilter("Archetypes");
        cy.get(filterDropDownContainer).find(filterDropDown).click();
        notExists(archetype2.name);

        deleteByList([archetype1, archetype2]);
        deleteByList(tags);
    });

    after("Perform test data clean up", function () {
        deleteByList(tagList);
        deleteByList(businessServicesList);
        deleteByList(applicationsList);
        deleteByList(stakeholders);
    });
});
