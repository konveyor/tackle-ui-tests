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
    deleteAllBusinessServices,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
    deleteApplicationTableRows,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleBusinessServices,
    createMultipleTags,
    deleteAllTagsAndTagCategories,
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
import * as data from "../../../../../utils/data_utils";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";

let stakeholdersList: Array<Stakeholders> = [];
let stakeholderGroupsList: Array<Stakeholdergroups> = [];

describe(["@tier3"], "Applications interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create data
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
        let businessServicesList = createMultipleBusinessServices(2);
        let tagList = createMultipleTags(2);
        let appdata = {
            name: data.getAppName(),
            business: businessServicesList[0].name,
            description: data.getDescription(),
            tags: [tagList[0].name],
            comment: data.getDescription(),
        };
        const application = new Assessment(appdata);
        application.create();
        cy.get("@getApplication");
        cy.wait(2 * SEC);

        application.tagAndCategoryExists(tagList[0].name);
        // Remove the BS and tags
        application.removeBusinessService();
        tagList[0].delete();

        // Navigate to application inventory
        clickByText(navMenu, applicationInventory);
        cy.wait(100);
        cy.get("@getApplication");

        // Assert that deleted business service is removed from application
        application.getColumnText(businessColumnSelector, "");
        cy.wait(100);

        // Assert that deleted tag is removed
        application.tagAndCategoryExists("");

        application.edit({
            business: businessServicesList[1].name,
            tags: [tagList[1].name],
        });
        cy.get("@getApplication");

        // Assert that business service is updated
        application.getColumnText(businessColumnSelector, businessServicesList[1].name);
        cy.wait(SEC);

        // Assert that created tag exists
        application.tagAndCategoryExists(tagList[1].name);
    });

    it("Stakeholder and stakeholder group delete dependency on application", function () {
        //Create application
        let appdata = {
            name: data.getAppName(),
            description: data.getDescription(),
            comment: data.getDescription(),
        };
        const application = new Assessment(appdata);
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

        // Delete the stakeholders, group
        stakeholdersList[0].delete();
        stakeholderGroupsList[0].delete();

        clickByText(navMenu, applicationInventory);
        application.selectApplication();
        application.click_assess_button();
        click(continueButton);
        cy.wait(6 * SEC);

        //Verify that values show blank
        cy.get(stakeholderSelect).should("have.value", "");
        cy.get(stakeholdergroupsSelect).should("have.value", "");
    });

    after("Perform test data clean up", function () {
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        deleteAllTagsAndTagCategories();
    });
});
