/// <reference types="cypress" />

import {
    click,
    hasToBeSkipped,
    login,
    preservecookies,
    createMultipleApplications,
    deleteApplicationTableRows,
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
        applicationsList = createMultipleApplications(3);
    });

    after("Perform test data clean up", function () {
        // Delete the applications
        deleteApplicationTableRows();
    });

    it("Non-cyclic dependencies", function () {
        var northboundApps: Array<string> = [applicationsList[0].name];
        var southboundApps: Array<string> = [applicationsList[2].name];

        // Add northbound and southbound dependencies for 2nd app from list
        applicationsList[1].addDependencies(northboundApps, southboundApps);

        // Verify app 1 contains 2nd app as its southbound dependency
        applicationsList[0].verifyDependencies([], [applicationsList[1].name]);

        // Verify app 3 contains 2nd app as its northbound dependency
        applicationsList[2].verifyDependencies([applicationsList[1].name]);

        // Remove the dependencies as part of cleanup for next test
        applicationsList[1].addDependencies(northboundApps, southboundApps);
    });

    it("Cyclic dependencies", function () {
        var northboundApps: Array<string> = [applicationsList[0].name];
        var southboundApps: Array<string> = [applicationsList[2].name];

        // Add northbound and southbound dependencies for 2nd app from list
        applicationsList[1].addDependencies(northboundApps, southboundApps);

        // Adding app 2 as northbound dependency for 1st app should yield cyclic error
        applicationsList[0].openManageDependencies();
        applicationsList[0].selectDependency(0, [applicationsList[1].name]);
        cy.wait(500);
        cy.get(northboundHelper).should("contain.text", cyclicDependenciesErrorMsg);
        click(closeForm);

        // Adding app 2 as southbound dependency for 3rd app should yield cyclic error
        applicationsList[2].openManageDependencies();
        applicationsList[2].selectDependency(1, [applicationsList[1].name]);
        cy.wait(500);
        cy.get(southboundHelper).should("contain.text", cyclicDependenciesErrorMsg);
        click(closeForm);
    });
});
