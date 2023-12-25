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
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleBusinessServices,
    createMultipleTags,
    deleteByList,
    deleteFromArrayByIndex,
    clickItemInKebabMenu,
    selectItemsPerPage,
} from "../../../../../utils/utils";
import { businessColumnSelector } from "../../../../views/applicationinventory.view";
import {
    continueButton,
    stakeholdergroupsSelect,
    stakeholderSelect,
} from "../../../../views/assessment.view";
import { navMenu } from "../../../../views/menu.view";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { applicationInventory, button, legacyPathfinder, SEC } from "../../../../types/constants";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import * as data from "../../../../../utils/data_utils";
import { Tag } from "../../../../models/migration/controls/tags";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";

let stakeholdersList: Array<Stakeholders> = [];
let stakeholderGroupsList: Array<Stakeholdergroups> = [];
let applicationList: Array<Application> = [];
let tagList: Array<Tag> = [];
let businessServicesList: Array<BusinessServices> = [];

describe(["@tier3"], "Applications interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        login();
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
        cy.wait(2 * SEC);

        application.applicationDetailsTab("Tags");
        application.tagAndCategoryExists(tagList[0].name);
        application.closeApplicationDetails();

        // Remove the BS and tags
        application.removeBusinessService();
        tagList[0].delete();
        deleteFromArrayByIndex(tagList, 0);

        // Navigate to application inventory
        clickByText(navMenu, applicationInventory);
        cy.wait(100);
        cy.get("@getApplication");

        // Assert that deleted business service is removed from application
        application.getColumnText(businessColumnSelector, "");
        cy.wait(100);

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
        cy.wait(SEC);

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
        cy.wait(2 * SEC);
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
        cy.get(stakeholderSelect).should("have.value", "");
        cy.get(stakeholdergroupsSelect).should("have.value", "");
        clickByText(button, "Cancel");
        cy.get(continueButton).click();
    });

    it("Validates association application tags to  archetype tags ", function () {
        //automates polarion MTA-401
        //create archytype
        tagList = createMultipleTags(3);
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tagList[0].name, tagList[2].name],
            [tagList[1].name],
            null
        );
        archetype.create();
        cy.wait(2 * SEC);

        //Create 3 appdatas containing different tags
        let appdata1 = {
            name: data.getAppName(),
            description: data.getDescription(),
            tags: [tagList[0].name, tagList[2].name],
            comment: data.getDescription(),
        };
        let appdata2 = {
            name: data.getAppName(),
            description: data.getDescription(),
            tags: [tagList[0].name, tagList[1].name],
            comment: data.getDescription(),
        };
        let appdata3 = {
            name: data.getAppName(),
            description: data.getDescription(),
            tags: [tagList[0].name, tagList[2].name],
            comment: data.getDescription(),
        };

        //assign different appdata to each app and check if tags are present
        const application1 = new Application(appdata1);
        applicationList.push(application1);
        application1.create();
        cy.get("@getApplication");
        cy.wait(2 * SEC);
        application1.applicationDetailsTab("Tags");
        appdata1.tags.forEach((tag) => {
            application1.tagAndCategoryExists(tag);
        });
        application1.closeApplicationDetails();

        const application2 = new Application(appdata2);
        applicationList.push(application2);
        application2.create();
        cy.get("@getApplication");
        cy.wait(2 * SEC);
        application2.applicationDetailsTab("Tags");
        appdata2.tags.forEach((tag) => {
            application2.tagAndCategoryExists(tag);
        });
        application2.closeApplicationDetails();

        const application3 = new Application(appdata3);
        applicationList.push(application3);
        application3.create();
        cy.get("@getApplication");
        cy.wait(2 * SEC);
        application3.applicationDetailsTab("Tags");
        appdata3.tags.forEach((tag) => {
            application3.tagAndCategoryExists(tag);
        });
        application3.closeApplicationDetails();

        //validate app count on archytpe
        archetype.getAssociatedAppsCount().then((appCount) => {
            expect(appCount).to.equal(2);
        });
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationList);
        deleteByList(businessServicesList);
    });
});
