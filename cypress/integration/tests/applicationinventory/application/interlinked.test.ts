/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    preservecookies,
    hasToBeSkipped,
    click,
    deleteAllBusinessServices,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
    deleteApplicationTableRows,
    deleteAllTagTypes,
} from "../../../../utils/utils";
import { Tag, Tagtype } from "../../../models/tags";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { businessColumnSelector } from "../../../views/applicationinventory.view";
import {
    continueButton,
    stakeholdergroupsSelect,
    stakeholderSelect,
} from "../../../views/assessment.view";
import { navMenu } from "../../../views/menu.view";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import { applicationinventory, button, assess } from "../../../types/constants";

import * as data from "../../../../utils/data_utils";
import { BusinessServices } from "../../../models/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersNameList: Array<string> = [];
var stakeholdergroupNameList: Array<string> = [];
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

        // Create multiple bussiness services and tags
        for (let i = 0; i < 2; i++) {
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);
            stakeholdersNameList.push(stakeholder.name);

            // Create new business service
            const businessservice = new BusinessServices(
                data.getCompanyName(),
                data.getDescription(),
                stakeholder.name
            );
            businessservice.create();
            businessservicesList.push(businessservice);

            //Create Tag type
            const tagType = new Tagtype(
                data.getRandomWord(8),
                data.getColor(),
                data.getRandomNumber()
            );
            tagType.create();

            // Create new tag
            const tag = new Tag(data.getRandomWord(6), tagType.name);
            tag.create();
            tagList.push(tag);

            // Navigate to application inventory tab and create new application
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(),
                businessservice.name,
                [tag.name]
            );
            application.create();
            applicationList.push(application);
            cy.wait(2000);
        }
    });

    beforeEach("Define interceptors", function () {
        // Interceptors for stakeholder groups
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");

        // Interceptors for applications
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
        deleteAllBusinessServices();
        deleteAllTagTypes();
        deleteApplicationTableRows();
    });

    it(
        "Stakeholder, businessservice, tag and stakeholdergroup delete dependency on application inventory",
        { tags: "@newtest" },
        function () {
            //Add stakeholder group
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription(),
                stakeholdersNameList
            );
            stakeholdergroup.create();
            stakeholdergroupNameList.push(stakeholdergroup.name);
            cy.wait("@postStakeholdergroups");
            exists(stakeholdergroup.name);

            // Perform assessment of application
            applicationList[1].perform_assessment(
                "low",
                stakeholdersNameList,
                stakeholdergroupNameList
            );
            cy.wait(2000);
            applicationList[1].is_assessed();

            // Delete the stakeholders
            stakeholdersList.forEach(function (stakeholder) {
                stakeholder.delete();
            });

            // Delete the stakeholdergroups
            stakeholdergroup.delete();

            // Clean up business service and tags
            businessservicesList[1].delete();
            tagList[1].delete();

            clickByText(navMenu, applicationinventory);
            cy.wait("@getApplication");

            // Assert that business service is updated
            applicationList[1].getColumnText(businessColumnSelector, "");
            cy.wait(100);

            // Assert that created tag exists
            applicationList[1].expandApplicationRow();
            applicationList[1].existsWithinRow(applicationList[1].name, "Tags", "");
            applicationList[1].closeApplicationRow();

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
