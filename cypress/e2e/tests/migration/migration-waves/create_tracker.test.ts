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

import { login, getRandomApplicationData } from "../../../../utils/utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import * as data from "../../../../utils/data_utils";
import { Application } from "../../../models/migration/applicationinventory/application";
import { createJiraButton } from "../../../views/jira.view";

const now = new Date();
now.setDate(now.getDate() + 1);
const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);
let application: Application;
let migrationWave: MigrationWave;

//Automates Polarion TC 358

describe(["@tier1"], "Testing the creation of a tracker in migration waves", function () {
    before("Login & Create new application", () => {
        login();
        application = new Application(getRandomApplicationData());
        application.create();
    });

    it("Verify create tracker button is visible", function () {
        MigrationWave.open();

        // create new migration wave
        migrationWave = new MigrationWave(data.getRandomWord(8), now, end, null, null, [
            application,
        ]);
        migrationWave.create();

        // expand the wave row by clicking on the wave status
        migrationWave.clickWaveStatus();
        migrationWave.removeApplications([application]);
        migrationWave.createTracker();

        // assert the current page redirect to the Jira configuration page
        cy.get("body").should("contain.text", "Jira configuration");
        cy.get(createJiraButton).should("be.visible");
    });

    after("Delete test data", function () {
        migrationWave.delete();
        application.delete();
    });
});
