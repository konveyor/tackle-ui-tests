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
    createMultipleStakeholders,
    createMultipleBusinessServices,
    generateRandomDateRange,
    cancelForm,
} from "../../../../utils/utils";
import { startDate, endDate, SortType } from "../../../types/constants";

import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { name } from "../../../types/constants";
import { MigrationWaveView } from "../../../views/migration-wave.view";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import * as data from "../../../../utils/data_utils";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { BusinessServices } from "../../../models/migration/controls/businessservices";

let migrationWavesList: MigrationWave[] = [];
let applicationsList: Assessment[] = [];

let stakeholdersList: Stakeholders[] = [];
let businessServicesList: BusinessServices[] = [];

//Automates Polarion TC 341
describe(["@tier2"], "Migration Waves sort validations", function () {
    before("Login and Create Test Data", function () {
        login();

        // Create multiple Migration Waves
        migrationWavesList = createMultipleMigrationWaves(2);
        stakeholdersList = createMultipleStakeholders(3);
        businessServicesList = createMultipleBusinessServices(3);
    });

    it("Name sort validations", function () {
        MigrationWave.open();

        const unsortedList = getTableColumnData(name);

        // Sort the Migration Waves by name in ascending order
        clickOnSortButton(name, SortType.ascending, MigrationWaveView.migrationWavesTable);

        // Verify that the Migration Waves rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // same as above for descending
        clickOnSortButton(name, SortType.descending, MigrationWaveView.migrationWavesTable);

        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Start date sort validations", function () {
        MigrationWave.open();

        const unsortedList = getTableColumnData(startDate);

        clickOnSortButton(startDate, SortType.ascending, MigrationWaveView.migrationWavesTable);

        const afterAscSortList = getTableColumnData(startDate);
        verifyDateSortAsc(afterAscSortList, unsortedList);

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
    it("Sort Manage applications table", function () {
        for (let i = 0; i < 3; i++) {
            const appdata = {
                name: data.getRandomWord(4),
                owner: stakeholdersList[i].name,
                business: businessServicesList[i].name,
            };
            const application = new Assessment(appdata);
            application.create();
            applicationsList.push(application);
        }
        const { start: startDate, end: endDate } = generateRandomDateRange();
        const migrationWave = new MigrationWave(data.getRandomWord(4), startDate, endDate);
        migrationWave.create();
        migrationWave.openManageApplications();
        const unsortedAppList = getTableColumnData("Application Name");
        const unsortedBusinessList = getTableColumnData("Business service");
        const unsortedOwnerList = getTableColumnData("Owner");
        //sort asc and desc for 3 columns
        clickOnSortButton(
            "Business service",
            SortType.ascending,
            MigrationWaveView.migrationWavesTable
        );
        const afterAscSortBusinessList = getTableColumnData("Business service");
        verifySortAsc(afterAscSortBusinessList, unsortedBusinessList);
        clickOnSortButton(
            "Application Name",
            SortType.ascending,
            MigrationWaveView.migrationWavesTable
        );
        const afterAscSortappList = getTableColumnData("Application Name");
        verifySortAsc(afterAscSortappList, unsortedAppList);

        clickOnSortButton("Owner", SortType.ascending, MigrationWaveView.migrationWavesTable);
        const afterAscSortOwnerList = getTableColumnData("Owner");
        verifySortAsc(afterAscSortOwnerList, unsortedOwnerList);
        clickOnSortButton(
            "Business service",
            SortType.ascending,
            MigrationWaveView.migrationWavesTable
        );
        const afterDescSortBusinessList = getTableColumnData("Business service");
        verifyDateSortDesc(afterDescSortBusinessList, unsortedBusinessList);
        clickOnSortButton(
            "Application Name",
            SortType.ascending,
            MigrationWaveView.migrationWavesTable
        );
        const afterDescSortappList = getTableColumnData("Application Name");
        verifyDateSortDesc(afterDescSortappList, unsortedAppList);

        clickOnSortButton("Owner", SortType.ascending, MigrationWaveView.migrationWavesTable);
        const afterDescSortOwnerList = getTableColumnData("Owner");
        verifyDateSortDesc(afterDescSortOwnerList, unsortedOwnerList);
        cancelForm();
        migrationWavesList.push(migrationWave);
    });

    after("Perform test data clean up", function () {
        // Delete the Migration Waves created before the tests
        deleteByList(migrationWavesList);
        deleteByList(applicationsList);
        deleteByList(stakeholdersList);
        deleteByList(businessServicesList);
    });
});
