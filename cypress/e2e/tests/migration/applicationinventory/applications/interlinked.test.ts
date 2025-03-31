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

import * as data from "../../../../../utils/data_utils";
import {
    clickByText,
    clickItemInKebabMenu,
    createMultipleBusinessServices,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    deleteFromArrayByIndex,
    login,
    selectItemsPerPage,
} from "../../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import { applicationInventory, button, legacyPathfinder } from "../../../../types/constants";
import { businessColumnSelector } from "../../../../views/applicationinventory.view";
import { continueButton, stakeholdersAndGroupsSelect } from "../../../../views/assessment.view";
import { navMenu } from "../../../../views/menu.view";

let stakeholdersList: Array<Stakeholders> = [];
let stakeholderGroupsList: Array<Stakeholdergroups> = [];
let applicationList: Array<Application> = [];
let tagList: Array<Tag> = [];
let businessServicesList: Array<BusinessServices> = [];

describe(["@tier3"], "Applications interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholdersList = createMultipleStakeholders(1);
        stakeholderGroupsList = createMultipleStakeholderGroups(1, stakeholdersList);
    });

    beforeEach("Define interceptors", function () {
        // Interceptors for stakeholder groups
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");

        // Interceptors for applications
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Business service, tag update and delete dependency on application", function () {
        businessServicesList = createMultipleBusinessServices(2);
        tagList = createMultipleTags(2);
        let appdata = {
            name: data.getAppName(),
            business: businessServicesList[0].name,
            description: data.getDescription(),
            tags: [tagList[0].name],
            comment: data.getDescription(),
        };
        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        cy.get("@getApplication");

        application.applicationDetailsTab("Tags");
        application.tagAndCategoryExists(tagList[0].name);
        application.closeApplicationDetails();

        // Remove the BS and tags
        application.removeBusinessService();
        tagList[0].delete();
        deleteFromArrayByIndex(tagList, 0);

        // Navigate to application inventory
        clickByText(navMenu, applicationInventory);
        cy.get("@getApplication");

        // Assert that deleted business service is removed from application
        application.getColumnText(businessColumnSelector, "");

        // Assert that deleted tag is removed
        application.applicationDetailsTab("Tags");
        application.noTagExists();
        application.closeApplicationDetails();

        application.edit({
            business: businessServicesList[1].name,
            tags: [tagList[1].name],
        });
        cy.get("@getApplication");

        // Assert that business service is updated
        application.getColumnText(businessColumnSelector, businessServicesList[1].name);

        // Assert that created tag exists
        application.applicationDetailsTab("Tags");
        application.tagAndCategoryExists(tagList[1].name);
        application.closeApplicationDetails();
    });

    it("Stakeholder and stakeholder group delete dependency on application", function () {
        //Create application
        let appdata = {
            name: data.getAppName(),
            description: data.getDescription(),
            comment: data.getDescription(),
        };
        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        cy.get("@getApplication");
        // Perform assessment of application
        application.perform_assessment("low", stakeholdersList, stakeholderGroupsList);
        application.verifyStatus("assessment", "Completed");

        // Delete the stakeholders, group and removing them from the list where they were added before
        stakeholdersList[0].delete();
        deleteFromArrayByIndex(stakeholdersList, 0);
        stakeholderGroupsList[0].delete();
        deleteFromArrayByIndex(stakeholderGroupsList, 0);

        clickByText(navMenu, applicationInventory);
        selectItemsPerPage(100);
        application.selectApplication();
        clickItemInKebabMenu(application.name, "Assess");
        clickByText(button, "Retake");

        //Verify that values show blank
        cy.get(stakeholdersAndGroupsSelect).should("have.value", "");
        clickByText(button, "Cancel");
        cy.get(continueButton).click();
    });

    it("Validates association application tags to  archetype tags ", function () {
        //automates polarion MTA-401
        tagList = createMultipleTags(3);
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tagList[0].name, tagList[2].name],
            [tagList[1].name],
            null
        );
        archetype.create();

        const tagCombinations = [
            [tagList[0].name, tagList[2].name],
            [tagList[0].name, tagList[1].name],
            [tagList[0].name, tagList[2].name],
        ];

        const appDataConfigs = tagCombinations.map((tags) => ({
            name: data.getAppName(),
            description: data.getDescription(),
            tags: tags,
            comment: data.getDescription(),
        }));

        appDataConfigs.forEach((appData) => {
            const application = new Application(appData);
            applicationList.push(application);
            application.create();
            cy.get("@getApplication");
            application.applicationDetailsTab("Tags");
            appData.tags.forEach((tag) => {
                application.tagAndCategoryExists(tag);
            });
            application.closeApplicationDetails();
        });

        //validate app count on archytpe
        archetype.getAssociatedAppsCount().then((appCount) => {
            expect(appCount).to.equal(2);
        });
        archetype.delete();
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationList);
        deleteByList(tagList);
        deleteByList(businessServicesList);
    });
});
