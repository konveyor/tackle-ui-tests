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
    createMultipleStakeholders,
    exists,
    importApplication,
    login,
    deleteApplicationTableRows,
    deleteAppImportsTableRows,
    notExists,
    deleteByList,
    deleteAllMigrationWaves,
} from "../../../../../utils/utils";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { legacyPathfinder } from "../../../../types/constants";

const filePath = "app_import/csv/";
let stakeholders: Stakeholders[];
let appdata = { name: "Customers" };

describe(["@tier2"], "Operations after application import", () => {
    before("Bug MTA-2451: Login and create test data", function () {
        login();
        // This test will fail if there are preexisting questionnaire.
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholders = createMultipleStakeholders(1);

        // Import applications through valid .CSV file
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");
    });

    it(
        "Perform application assessment after a successful application import",
        { tags: "@dc" },
        function () {
            const application = new Application(appdata);

            // Perform assessment of application
            application.perform_assessment("low", stakeholders);
            cy.wait(2000);
            application.verifyStatus("assessment", "Completed");
        }
    );

    it("Perform application review after a successful application import", function () {
        // Automates Polarion TC MTA-295
        const application = new Application(appdata);

        // Perform application review
        application.perform_review("low");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        // Delete application
        application.delete();
        cy.wait(2000);
        notExists(application.name);
    });

    after("Perform test data clean up", function () {
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
        deleteByList(stakeholders);
    });
});
