/// <reference types="cypress" />

import {
    click,
    hasToBeSkipped,
    login,
    preservecookies,
    verifyDependencies,
} from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import * as data from "../../../../utils/data_utils";
import {
    closeForm,
    cyclicDependenciesErrorMsg,
    northboundHelper,
    southboundHelper,
} from "../../../views/applicationinventory.view";

var applicationsList: Array<ApplicationInventory> = [];

describe("Manage application dependencies", { tags: "@newtest" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Create new applications
        for (let i = 0; i < 3; i++) {
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription()
            );
            application.create();
            applicationsList.push(application);
        }
    });

    after("Perform test data clean up", function () {
        // Delete the applications
        if (applicationsList.length > 0) {
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

        // Remove the dependencies as part of cleanup for next test
        applicationsList[1].addDependencies(northboundApps, southboundApps);
    });

    it("Cyclic dependencies", function () {
        var northboundApps: Array<string> = [applicationsList[0].name];
        var southboundApps: Array<string> = [applicationsList[2].name];

        // Add northbound and southbound dependencies for 2nd app from list
        applicationsList[1].addDependencies(northboundApps, southboundApps);

        // Adding app 2 as northbound dependency for 1st app should yield cyclic eror
        applicationsList[0].openManageDependencies();
        applicationsList[0].selectDependency(0, [applicationsList[1].name]);
        cy.wait(500);
        cy.get(northboundHelper).should("contain.text", cyclicDependenciesErrorMsg);
        click(closeForm);

        // Adding app 2 as northbound dependency for 3rd app should yield cyclic eror
        applicationsList[2].openManageDependencies();
        applicationsList[2].selectDependency(1, [applicationsList[1].name]);
        cy.wait(500);
        cy.get(southboundHelper).should("contain.text", cyclicDependenciesErrorMsg);
        click(closeForm);
    });
});
