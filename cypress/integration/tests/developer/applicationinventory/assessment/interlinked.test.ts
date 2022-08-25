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
    notExists,
    preservecookies,
    hasToBeSkipped,
    click,
    deleteAllBusinessServices,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
    deleteApplicationTableRows,
    deleteAllTagTypes,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleBusinessServices,
    createMultipleTags,
} from "../../../../../utils/utils";
import { businessColumnSelector } from "../../../../views/applicationinventory.view";
import {
    continueButton,
    stakeholdergroupsSelect,
    stakeholderSelect,
} from "../../../../views/assessment.view";
import { navMenu } from "../../../../views/menu.view";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/developer/controls/stakeholdergroups";
import { applicationInventory, button, assess } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { Assessment } from "../../../../models/developer/applicationinventory/assessment";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];

describe("Applications interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        stakeholdergroupsList = createMultipleStakeholderGroups(1, stakeholdersList);
    });

    beforeEach("Define interceptors", function () {
        // Interceptors for stakeholder groups
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");

        // Interceptors for applications
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        deleteAllStakeholders();
        deleteAllStakeholderGroups();
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        deleteAllTagTypes();
    });

    it(
        "businessservice, tag update and delete dependency on application",
        { tags: "@tier1" },
        function () {
            let businessservicesList = createMultipleBusinessServices(2);
            let tagList = createMultipleTags(2);
            let appdata = {
                name: data.getAppName(),
                business: businessservicesList[0].name,
                description: data.getDescription(),
                tags: [tagList[0].name],
                comment: data.getDescription(),
            };
            const application = new Assessment(appdata);
            application.create();
            cy.wait("@getApplication");
            cy.wait(2000);

            application.verifyTagCount(1);
            // Remove the BS and tags
            application.removeBusinessService();

            // businessservicesList[0].delete();
            // notExists(businessservicesList[0].name);

            tagList[0].delete();

            // Navigate to application inventory
            clickByText(navMenu, applicationInventory);
            cy.wait(100);
            cy.wait("@getApplication");

            // Assert that deleted business service is removed from application
            application.getColumnText(businessColumnSelector, "");
            cy.wait(100);

            // Assert that deleted tag is removed
            application.expandApplicationRow();
            application.existsWithinRow(application.name, "Tags", "");
            application.closeApplicationRow();
            application.verifyTagCount(0);

            application.edit({
                business: businessservicesList[1].name,
                tags: [tagList[1].name],
            });
            cy.wait("@getApplication");

            // Assert that business service is updated
            application.getColumnText(businessColumnSelector, businessservicesList[1].name);
            cy.wait(1000);

            // Assert that created tag exists
            application.expandApplicationRow();
            application.existsWithinRow(application.name, "Tags", tagList[1].name);
            application.closeApplicationRow();
            application.verifyTagCount(1);
            cy.wait(1000);
        }
    );

    it(
        "Stakeholder and stakeholdergroup delete dependency on application",
        { tags: "@newtest" },
        function () {
            //Create application
            let appdata = {
                name: data.getAppName(),
                description: data.getDescription(),
                comment: data.getDescription(),
            };
            const application = new Assessment(appdata);
            application.create();
            cy.wait("@getApplication");
            cy.wait(2000);
            // Perform assessment of application
            application.perform_assessment(
                "low",
                [stakeholdersList[0].name],
                [stakeholdergroupsList[0].name]
            );
            cy.wait(2000);
            application.is_assessed();

            // Delete the stakeholders, group
            stakeholdersList[0].delete;
            stakeholdergroupsList[0].delete();

            application.selectApplication();
            clickByText(button, assess);
            click(continueButton);
            cy.wait(6000);

            //Verify that values show blank
            cy.get(stakeholderSelect).should("have.value", "");
            cy.get(stakeholdergroupsSelect).should("have.value", "");
        }
    );
});
