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

import * as data from "../../../../utils/data_utils";
import {
    applySearchFilter,
    clickByText,
    createMultipleApplicationsWithBSandTags,
    createMultipleBusinessServices,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    login,
} from "../../../../utils/utils";
import { Application } from "../../../models/migration/applicationinventory/application";
import { BusinessServices } from "../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Tag } from "../../../models/migration/controls/tags";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import {
    businessServiceLower,
    button,
    clearAllFilters,
    manageApplications,
    name,
    owner,
} from "../../../types/constants";

const now = new Date();
now.setDate(now.getDate() + 1);
const end = new Date(now.getTime());

end.setFullYear(end.getFullYear() + 1);
let applicationsList: Application[] = [];
let businessServicesList: BusinessServices[] = [];
let tagList: Tag[] = [];
let stakeholders: Stakeholders[] = [];

//Automates Polarion MTA-354
describe(
    ["@tier3"],
    "Migration waves: Filter validations on Manage applications modal",
    function () {
        before("Login and Create Test Data", function () {
            login();
            cy.visit("/");
            businessServicesList = createMultipleBusinessServices(2);
            tagList = createMultipleTags(2);
            stakeholders = createMultipleStakeholders(2);
            applicationsList = createMultipleApplicationsWithBSandTags(
                2,
                businessServicesList,
                tagList,
                stakeholders
            );
        });

        it("Filter applications by name", function () {
            const migrationWave = new MigrationWave(
                data.getRandomWord(8),
                now,
                end,
                null,
                null,
                applicationsList
            );
            migrationWave.create();
            migrationWave.expandActionsMenu();
            cy.contains(manageApplications).click();

            // Enter an existing exact name and apply it as search filter
            applySearchFilter(name, applicationsList[1].name, true, 1);
            cy.get("td").should("contain", applicationsList[1].name);
            cy.get("td").should("not.contain", applicationsList[0].name);
            clickByText(button, clearAllFilters);

            // Enter a non-existing app name and apply it as search filter
            applySearchFilter(name, String(data.getRandomNumber()), true, 1);
            cy.get("td").should("not.contain", applicationsList[1].name);
            cy.get("td").should("not.contain", applicationsList[0].name);
            clickByText(button, clearAllFilters);
            clickByText(button, "Cancel");
            migrationWave.delete();
        });

        it("Filter applications by business service", function () {
            const migrationWave = new MigrationWave(
                data.getRandomWord(8),
                now,
                end,
                null,
                null,
                applicationsList
            );
            migrationWave.create();
            migrationWave.expandActionsMenu();
            cy.contains(manageApplications).click();

            // Apply BS associated with applicationsList[1].name as search filter
            applySearchFilter(businessServiceLower, applicationsList[1].business, true, 1);
            cy.get("td").should("contain", applicationsList[1].name);
            cy.get("td").should("not.contain", applicationsList[0].name);
            clickByText(button, clearAllFilters);

            // Apply BS associated with applicationsList[0].name as search filter
            applySearchFilter(businessServiceLower, applicationsList[0].business, true, 1);
            cy.get("td").should("not.contain", applicationsList[1].name);
            cy.get("td").should("contain", applicationsList[0].name);
            clickByText(button, clearAllFilters);
            clickByText(button, "Cancel");
            migrationWave.delete();
        });

        it("Filter applications by owner", function () {
            const migrationWave = new MigrationWave(
                data.getRandomWord(8),
                now,
                end,
                null,
                null,
                applicationsList
            );
            migrationWave.create();
            migrationWave.expandActionsMenu();
            cy.contains(manageApplications).click();

            // Apply owner associated with applicationsList[1].name as search filter
            applySearchFilter(owner, stakeholders[1].name, true, 1);
            cy.get("td").should("contain", applicationsList[1].name);
            cy.get("td").should("not.contain", applicationsList[0].name);
            clickByText(button, clearAllFilters);

            // Apply owner associated with applicationsList[0].name as search filter
            applySearchFilter(owner, stakeholders[0].name, true, 1);
            cy.get("td").should("not.contain", applicationsList[1].name);
            cy.get("td").should("contain", applicationsList[0].name);
            clickByText(button, clearAllFilters);
            clickByText(button, "Cancel");
            migrationWave.delete();
        });

        after("Perform test data clean up", function () {
            deleteByList(applicationsList);
            deleteByList(businessServicesList);
            deleteByList(tagList);
            deleteByList(stakeholders);
        });
    }
);
