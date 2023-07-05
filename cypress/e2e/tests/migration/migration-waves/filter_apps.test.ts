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
    login,
    clickByText,
    applySearchFilter,
    deleteByList,
    createMultipleApplications,
} from "../../../../utils/utils";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../models/migration/controls/stakeholdergroups";
import { manageApplications, button, name, clearAllFilters, SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";

let stakeHolders: Stakeholders[];
let stakeHolderGroups: Stakeholdergroups[];
const now = new Date();
now.setDate(now.getDate() + 1);
const end = new Date(now.getTime());

end.setFullYear(end.getFullYear() + 1);
let migrationWavesList: Array<MigrationWave> = [];
//Automates Polarion TC 343
describe(["@tier2"], "Migration waves: Filter validations on Manage applications modal", function () {
    before("Login and Create Test Data", function () {
        login();
    });

    it("Filter applications by name", function () {
        const applications = createMultipleApplications(2);
        const migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            stakeHolders,
            stakeHolderGroups,
            applications
        );
        migrationWave.create();
        MigrationWave.open();
        migrationWave.expandActionsMenu();
        cy.contains(manageApplications).click();

        // Enter an existing exact name and apply it as search filter
        applySearchFilter(name, applications[1].name, true, 1);
        cy.get("td").should("contain", applications[1].name);
        cy.get("td").should("not.contain", applications[0].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, String(data.getRandomNumber()), true, 1);

        // Assert that no search results are found
        cy.get("td").should("not.exist");
        clickByText(button, clearAllFilters);

        migrationWave.delete()
    });
});
