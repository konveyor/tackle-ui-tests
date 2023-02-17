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
    clickByText,
    getRandomApplicationData,
    exists,
    importApplication,
    login,
    openManageImportsPage,
    openErrorReport,
    verifyAppImport,
    verifyImportErrorMsg,
    deleteApplicationTableRows,
    preservecookies,
    hasToBeSkipped,
    selectUserPerspective,
    deleteAllBusinessServices,
    deleteAppImportsTableRows,
    notExists,
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";
import { navMenu } from "../../../../views/menu.view";
import { applicationInventory, button, SEC } from "../../../../types/constants";
import { Assessment } from "../../../../models/developer/applicationinventory/assessment";

const businessService = new BusinessServices("BS_tag_test");
const filePath = "app_import/csv/";
var applicationsList: Array<Assessment> = [];
const stakeholdersNameList: Array<string> = [];

describe("Operations after application import", () => {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Delete the existing application rows
        // deleteApplicationTableRows();
        // deleteAllBusinessServices();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
        // deleteAppImportsTableRows();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        // Delete the existing application rows before deleting business service(s)
        clickByText(navMenu, applicationInventory);
        deleteApplicationTableRows();
    });

    it("Perform assessment after a successful application import", { tags: "@tier1" }, function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait(2000);
        // cy.wait("@getApplication");

        /*
        // Import valid csv
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway"); */

        const application = new Assessment(getRandomApplicationData("Customers", true));
        // Perform assessment of application
        application.perform_assessment("low", stakeholdersNameList);
        cy.wait(2000);
        application.verifyStatus("assessment", "Completed");

        // Perform application review
        application.perform_review("low");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        // Delete application
        application.delete();
        cy.wait(2000);
    });
}
)