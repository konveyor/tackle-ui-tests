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

const now = new Date();
now.setDate(now.getDate() + 1);
const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);
let applicationsList: Assessment[] = [];
let migrationWave: MigrationWave;

import { login, getRandomApplicationData, deleteByList } from "../../../../utils/utils";

import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import * as data from "../../../../utils/data_utils";

//Automates Polarion TC 358

describe(["@tier1"], "Testing the creation of a tracker in migration waves", function () {
    before("Create test data", () => {
        login();
        const application = new Assessment(getRandomApplicationData());
        application.create();
        applicationsList.push(application);
    });

    beforeEach("Login", function () {
        cy.intercept("POST", "/hub/migrationwaves*").as("postWave");
        cy.intercept("PUT", "/hub/migrationwaves*/*").as("putWave");
        cy.intercept("DELETE", "/hub/migrationwaves*/*").as("deleteWave");
    });

    it("Create Tracker", function () {
        MigrationWave.open();

        // create new migration wave
        migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            null,
            null,
            applicationsList
        );
        migrationWave.create();

        // expand the wave row but clicking on the application status
        migrationWave.clickOnApplicationStatus();
        migrationWave.removeApplication(applicationsList[0].name);
        migrationWave.createTracker();

        // assert the current page redirect to is the Jira configuration page
        cy.get("body").should("contain.text", "Jira configuration");
    });

    after("Delete test data", function () {
        deleteByList(applicationsList);
        migrationWave.delete();
    });
});
