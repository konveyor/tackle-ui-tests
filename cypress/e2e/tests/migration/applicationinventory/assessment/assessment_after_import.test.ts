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
    deleteAllMigrationWaves,
    deleteAppImportsTableRows,
    deleteApplicationTableRows,
    deleteByList,
    exists,
    importApplication,
    login,
    notExists,
} from "../../../../../utils/utils";

import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { legacyPathfinder } from "../../../../types/constants";

const filePath = "app_import/csv/";
let stakeholders: Stakeholders[];
let appdata = { name: "Customers" };

describe(["@tier3"], "Operations after application import", () => {
    before("Login and create test data", function () {
        login();
        cy.visit("/");
        // This test will fail if there are preexisting questionnaire.
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholders = createMultipleStakeholders(1);

        // Import applications through valid .CSV file
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");
    });

    it(
        ["@dc"],
        "Perform application assessment after a successful application import",
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

        application.perform_review("low");
        application.verifyStatus("review", "Completed");

        application.delete();
        notExists(application.name);
    });

    after("Perform test data clean up", function () {
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
        deleteByList(stakeholders);
    });
});
