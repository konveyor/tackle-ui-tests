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
    click,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleBusinessServices,
    createMultipleTags,
    deleteByList,
    deleteFromArrayByIndex,
    clickItemInKebabMenu,
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
import { applicationInventory, SEC } from "../../../../types/constants";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import * as data from "../../../../../utils/data_utils";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { Tag } from "../../../../models/migration/controls/tags";

let stakeholdersList: Array<Stakeholders> = [];
let stakeholderGroupsList: Array<Stakeholdergroups> = [];
let applicationList: Array<Assessment> = [];
let tagList: Array<Tag> = [];
let businessServicesList: Array<BusinessServices> = [];

describe(["@tier3"], "Applications interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        login();

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
        const application = new Assessment(appdata);
        applicationList.push(application);
        application.create();
        cy.get("@getApplication");
        cy.wait(2 * SEC);

        application.applicationDetailsTab("Tags");
        application.tagAndCategoryExists(tagList[0].name);
        application.closeApplicationDetails();

        // Remove the BS and tags
        application.removeBusinessService();
        cy.wait(5000);
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
        const application = new Assessment(appdata);
        applicationList.push(application);
        application.create();
        cy.get("@getApplication");
        cy.wait(2 * SEC);
        // Perform assessment of application
        application.perform_assessment(
            "low",
            [stakeholdersList[0].name],
            [stakeholderGroupsList[0].name]
        );
        application.verifyStatus("assessment", "Completed");

        // Delete the stakeholders, group and removing them from the list where they were added before
        stakeholdersList[0].delete();
        deleteFromArrayByIndex(stakeholdersList, 0);
        stakeholderGroupsList[0].delete();
        deleteFromArrayByIndex(stakeholderGroupsList, 0);

        clickByText(navMenu, applicationInventory);
        application.selectApplication();
        clickItemInKebabMenu(application.name, "Assess");
        // application.click_assess_button();
        click(continueButton);
        cy.wait(6 * SEC);

        //Verify that values show blank
        cy.get(stakeholderSelect).should("have.value", "");
        cy.get(stakeholdergroupsSelect).should("have.value", "");
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
        deleteByList(businessServicesList);
    });
});
