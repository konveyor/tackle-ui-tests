/// <reference types="cypress" />

import { hasToBeSkipped, login, verifyDependencies } from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import * as data from "../../../../utils/data_utils";

var applicationsList: Array<ApplicationInventory> = [];

describe("Manage application dependencies", { tags: "@newtest" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        for (let i = 0; i < 3; i++) {
            // Create new applications
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription()
            );
            application.create();
            applicationsList.push(application);
        }
    });

    beforeEach("Login", function () {
        // Interceptors
        cy.intercept("POST", "/api/application-inventory/application*").as("postApplication");
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (applicationsList.length > 0) {
            // Delete the applications
            applicationsList.forEach(function (application) {
                application.delete();
            });
        }
    });
    it("Non-cyclic dependencies", function () {
        var northboundApps: Array<string> = [applicationsList[0].name];
        var southboundApps: Array<string> = [applicationsList[2].name];

        // Add northbound and southbound dependencies for 2nd app from list
        applicationsList[1].addDependencies(northboundApps, southboundApps);

        // Verify app 1 contains 2nd app as its southbound dependency
        verifyDependencies(applicationsList[0], [], [applicationsList[1].name]);

        // Verify app 3 contains 2nd app as its northbound dependency
        verifyDependencies(applicationsList[2], [applicationsList[1].name]);
    });
});
