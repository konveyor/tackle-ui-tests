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
    exists,
    importApplication,
    login,
    deleteApplicationTableRows,
    hasToBeSkipped,
    deleteAppImportsTableRows,
    notExists,
    preservecookies,
} from "../../../../../utils/utils";

import * as data from "../../../../../utils/data_utils";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { Assessment } from "../../../../models/developer/applicationinventory/assessment";

const filePath = "app_import/csv/";
const stakeholdersList: Array<Stakeholders> = [];
const stakeholdersNameList: Array<string> = [];
let appdata = { name: "Customers" };

describe("Operations after application import", () => {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

        // Delete the existing application rows
        deleteApplicationTableRows();
        deleteAppImportsTableRows();

        // Import applications through valid .CSV file
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it(
        "Perform application assessment after a successful application import",
        { tags: "@tier2" },
        function () {
            const application = new Assessment(appdata);

            // Perform assessment of application
            application.perform_assessment("low", stakeholdersNameList);
            cy.wait(2000);
            application.verifyStatus("assessment", "Completed");
        }
    );

    it(
        "Perform application review after a successful application import",
        { tags: "@tier2" },
        function () {
            // Automates https://polarion.engineering.redhat.com/polarion/redirect/project/MTAPathfinder/workitem?id=MTA-295
            const application = new Assessment(appdata);

            // Perform application review
            application.perform_review("low");
            cy.wait(2000);
            application.verifyStatus("review", "Completed");

            // Delete application
            application.delete();
            cy.wait(2000);
            notExists(application.name);
        }
    );

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the existing application rows before deleting business service(s)
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
    });
});
