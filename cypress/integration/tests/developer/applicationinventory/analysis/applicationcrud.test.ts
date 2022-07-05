/// <reference types="cypress" />

import {
    exists,
    hasToBeSkipped,
    login,
    preservecookies,
    deleteAllStakeholders,
    createMultipleBusinessServices,
    deleteAllBusinessServices,
    notExists,
} from "../../../../../utils/utils";

import { ApplicationInventory } from "../../../../models/developer/applicationinventory/applicationinventory";

import * as data from "../../../../../utils/data_utils";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";

import { publicRepo } from "./analysis_config";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersNameList: Array<string> = [];
var businessservicesList: Array<BusinessServices> = [];

describe("Application crud operations from the Analysis tab", { tags: "@tier1" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Navigate to Business service control tab and create a new business service
        businessservicesList = createMultipleBusinessServices(1);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier1")) return;

        // Delete the business service created before the tests
        deleteAllBusinessServices();
    });

    it("Application crud operations", function () {
        // Navigate to application inventory tab and create new application
        //Create application
        const application = new ApplicationInventory(
            data.getAppName(),
            businessservicesList[0].name,
            data.getDescription(),
            data.getDescription(),
            undefined,
            publicRepo.analysis,
            publicRepo.repoType,
            publicRepo.sourceRepo
        );
        application.create();
        exists(application.name);
        cy.wait("@getApplication");
        cy.wait(2000);

        /*// Edit application's name
        var updatedApplicationName = data.getAppName();
        application.edit({ name: updatedApplicationName });
        exists(updatedApplicationName);
        cy.wait("@getApplication");*/

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        notExists(application.name);
    });
});
