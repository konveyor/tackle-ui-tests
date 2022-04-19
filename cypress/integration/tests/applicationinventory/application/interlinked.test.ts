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
    createMultipleApplications,
} from "../../../../utils/utils";
import { Tag } from "../../../models/tags";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { businessColumnSelector } from "../../../views/applicationinventory.view";
import {
    continueButton,
    stakeholdergroupsSelect,
    stakeholderSelect,
} from "../../../views/assessment.view";
import { navMenu } from "../../../views/menu.view";
import { navTab } from "../../../views/menu.view";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import {
    applicationInventory,
    controls,
    businessServices,
    tags,
    button,
    assess,
} from "../../../types/constants";
import { BusinessServices } from "../../../models/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var businessservicesList: Array<BusinessServices> = [];
var tagList: Array<Tag> = [];
var applicationList: Array<ApplicationInventory> = [];

describe("Application inventory interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Create data
        stakeholdersList = createMultipleStakeholders(2);
        stakeholdergroupsList = createMultipleStakeholderGroups(2, stakeholdersList);
        businessservicesList = createMultipleBusinessServices(2, stakeholdersList);
        tagList = createMultipleTags(2);
        applicationList = createMultipleApplications(2, businessservicesList, tagList);
    });

    beforeEach("Define interceptors", function () {
        // Interceptors for stakeholder groups
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");

        // Interceptors for applications
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        deleteAllStakeholders();
        deleteAllStakeholderGroups();
        deleteAllBusinessServices();
        deleteAllTagTypes();
        deleteApplicationTableRows();
    });

    it(
        "Business Service update and delete dependency on application inventory",
        { tags: "@tier1" },
        function () {
            // Navigate to Business Service and delete
            clickByText(navMenu, controls);
            clickByText(navTab, businessServices);

            //Delete associated business service
            businessservicesList[0].delete();
            notExists(businessservicesList[0].name);

            // Navigate to tags and delete
            clickByText(navTab, tags);
            tagList[0].delete();

            // Navigate to application inventory
            clickByText(navMenu, applicationInventory);
            cy.wait(100);
            cy.wait("@getApplication");

            // Assert that deleted business service is removed from application
            applicationList[0].getColumnText(businessColumnSelector, "");
            cy.wait(100);

            // Assert that deleted tag is removed
            applicationList[0].expandApplicationRow();
            applicationList[0].existsWithinRow(applicationList[0].name, "Tags", "");
            applicationList[0].closeApplicationRow();

            applicationList[0].edit({
                business: businessservicesList[1].name,
                tags: [tagList[1].name],
            });
            cy.wait("@getApplication");

            // Assert that business service is updated
            applicationList[0].getColumnText(businessColumnSelector, businessservicesList[1].name);
            cy.wait(1000);

            // Assert that created tag exists
            applicationList[0].expandApplicationRow();
            applicationList[0].existsWithinRow(applicationList[0].name, "Tags", tagList[1].name);
            applicationList[0].closeApplicationRow();
            cy.wait(1000);
        }
    );

    it(
        "Stakeholder, businessservice, tag and stakeholdergroup delete dependency on application inventory",
        { tags: "@newtest" },
        function () {
            // Perform assessment of application
            applicationList[1].perform_assessment(
                "low",
                [stakeholdersList[1].name],
                [stakeholdergroupsList[1].name]
            );
            cy.wait(2000);
            applicationList[1].is_assessed();
            //check the tag count on the application
            applicationList[1].verifyTagCount(1);

            // Delete the stakeholders, group , BS and tags
            stakeholdersList[1].delete;
            stakeholdergroupsList[1].delete();
            businessservicesList[1].delete();
            tagList[1].delete();

            clickByText(navMenu, applicationInventory);
            cy.wait("@getApplication");

            // Assert that business service is updated
            applicationList[1].getColumnText(businessColumnSelector, "");
            cy.wait(100);

            // Assert that created tag exists
            applicationList[1].expandApplicationRow();
            applicationList[1].existsWithinRow(applicationList[1].name, "Tags", "");
            applicationList[1].closeApplicationRow();
            // Verify that tag count is updated once the tag is deleted.
            applicationList[1].verifyTagCount(0);

            applicationList[1].selectApplication();
            clickByText(button, assess);
            click(continueButton);
            cy.wait(6000);

            //Verify that values show blank
            cy.get(stakeholderSelect).should("have.value", "");
            cy.get(stakeholdergroupsSelect).should("have.value", "");
        }
    );
});
