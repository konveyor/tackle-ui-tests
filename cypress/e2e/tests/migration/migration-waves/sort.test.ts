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
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    deleteByList,
    createMultipleMigrationWaves,
    verifyDateSortAsc,
    verifyDateSortDesc,
    clickOnSortButton,
} from "../../../../utils/utils";
import { startDate, endDate, SortType } from "../../../types/constants";

import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { name } from "../../../types/constants";
import { MigrationWaveView } from "../../../views/migration-wave.view";

let migrationWavesList: MigrationWave[] = [];

//Automates Polarion TC 341
describe(["@tier2"], "Migration Waves sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple Migration Waves
        migrationWavesList = createMultipleMigrationWaves(2);
    });

    it("Name sort validations", function () {
        // Navigate to Migration Waves tab
        MigrationWave.open();
        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the Migration Waves by name in ascending order
        clickOnSortButton(name, SortType.ascending, MigrationWaveView.migrationWavesTable);

        // Verify that the Migration Waves rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Migration Waves by name in descending order
        clickOnSortButton(name, SortType.descending, MigrationWaveView.migrationWavesTable);

        // Verify that the Migration Waves rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Start date sort validations", function () {
        MigrationWave.open();

        const unsortedList = getTableColumnData(startDate);

        // Sort the Migration Waves by Start date in ascending order
        clickOnSortButton(startDate, SortType.ascending, MigrationWaveView.migrationWavesTable);

        const afterAscSortList = getTableColumnData(startDate);
        verifyDateSortAsc(afterAscSortList, unsortedList);

        // Sort the Migration Waves by Start date in descending order
        clickOnSortButton(startDate, SortType.descending, MigrationWaveView.migrationWavesTable);

        const afterDescSortList = getTableColumnData(startDate);
        verifyDateSortDesc(afterDescSortList, unsortedList);
    });

    it("End date sort validations", function () {
        MigrationWave.open();

        const unsortedList = getTableColumnData(endDate);

        clickOnSortButton(endDate, SortType.ascending, MigrationWaveView.migrationWavesTable);

        const afterAscSortList = getTableColumnData(endDate);
        verifyDateSortAsc(afterAscSortList, unsortedList);

        clickOnSortButton(endDate, SortType.descending, MigrationWaveView.migrationWavesTable);

        const afterDescSortList = getTableColumnData(endDate);
        verifyDateSortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        // Delete the Migration Waves created before the tests
        deleteByList(migrationWavesList);
    });
});
