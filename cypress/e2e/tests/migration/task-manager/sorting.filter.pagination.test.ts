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

import { randomWordGenerator } from "../../../../utils/data_utils";
import {
    clearAllFilters,
    deleteApplicationTableRows,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateNumberPresence,
    validatePagination,
    validateSortBy,
    validateTextPresence,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { taskFilter, trTag } from "../../../types/constants";
import { taskManagerColumns } from "../../../views/taskmanager.view";

describe(["@tier3"], "Filtering, sorting and pagination in Task Manager Page", function () {
    const applicationsList: Analysis[] = [];
    const sortByList = ["ID", "Application", "Status", "Kind", "Priority", "Created By"];

    before("Login", function () {
        login();
        deleteApplicationTableRows();
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 3; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("TaskFilteringApp1_" + i, {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["analysis_for_openSourceLibraries"])
                    );
                    applicationsList.push(bookServerApp);
                }
            });
        });

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 3; i++) {
                    const dayTraderApp = new Analysis(
                        getRandomApplicationData("TaskFilteringApp2_" + i, {
                            sourceData: appData["daytrader-app"],
                        }),
                        getRandomAnalysisData(analysisData["source+dep_analysis_on_daytrader-app"])
                    );
                    applicationsList.push(dayTraderApp);
                }

                applicationsList.forEach((application) => application.create());
            });
        });
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Filtering tasks", function () {
        // Analyzing daytrader app for pagination test to generate issues more than 10.
        const dayTraderApp = applicationsList[1];

        Analysis.analyzeAll(dayTraderApp);
        TaskManager.open();
        // Filter by status
        TaskManager.applyAndValidateFilter(taskFilter.status, "Pending");
        validateTextPresence(taskManagerColumns.status, "Pending");
        validateTextPresence(taskManagerColumns.status, "Running", false);
        validateTextPresence(taskManagerColumns.status, "Succeeded", false);
        clearAllFilters();
        TaskManager.applyAndValidateFilter(taskFilter.status, "Running");
        validateTextPresence(taskManagerColumns.status, "Running");
        validateTextPresence(taskManagerColumns.status, "Pending", false);
        validateTextPresence(taskManagerColumns.status, "Succeeded", false);
        clearAllFilters();
        TaskManager.applyAndValidateFilter(taskFilter.status, "Succeeded");
        validateTextPresence(taskManagerColumns.status, "Succeeded");
        validateTextPresence(taskManagerColumns.status, "Running", false);
        validateTextPresence(taskManagerColumns.status, "Pending", false);
        clearAllFilters();

        // Filter by ID
        TaskManager.applyAndValidateFilter(taskFilter.id, "1");
        validateNumberPresence(taskManagerColumns.id, 1);
        clearAllFilters();
        TaskManager.applyAndValidateFilter(taskFilter.id, "2");
        validateNumberPresence(taskManagerColumns.id, 2);
        clearAllFilters();

        // Filter by Applications
        TaskManager.applyAndValidateFilter(taskFilter.applicationName, applicationsList[0].name);
        validateTextPresence(taskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(taskManagerColumns.application, applicationsList[1].name, false);
        validateTextPresence(taskManagerColumns.kind, "analyzer");
        validateTextPresence(taskManagerColumns.kind, "language-discovery");
        validateTextPresence(taskManagerColumns.kind, "tech-discovery");
        validateTextPresence(taskManagerColumns.status, "Running");
        validateTextPresence(taskManagerColumns.status, "Succeeded");
        clearAllFilters();

        TaskManager.applyAndValidateFilter(taskFilter.applicationName, applicationsList[1].name);
        validateTextPresence(taskManagerColumns.application, applicationsList[1].name);
        validateTextPresence(taskManagerColumns.kind, "analyzer");
        validateTextPresence(taskManagerColumns.kind, "language-discovery");
        validateTextPresence(taskManagerColumns.kind, "tech-discovery");
        clearAllFilters();

        // Filter by Kind
        TaskManager.applyAndValidateFilter(taskFilter.kind, "analyzer");
        validateTextPresence(taskManagerColumns.kind, "analyzer");
        validateTextPresence(taskManagerColumns.kind, "language-discovery", false);
        validateTextPresence(taskManagerColumns.kind, "tech-discovery", false);
        clearAllFilters();
        TaskManager.applyAndValidateFilter(taskFilter.kind, "language-discovery");
        validateTextPresence(taskManagerColumns.kind, "language-discovery");
        validateTextPresence(taskManagerColumns.kind, "analyzer", false);
        validateTextPresence(taskManagerColumns.kind, "tech-discovery", false);
        clearAllFilters();
        TaskManager.applyAndValidateFilter(taskFilter.kind, "tech-discovery");
        validateTextPresence(taskManagerColumns.kind, "tech-discovery");
        validateTextPresence(taskManagerColumns.kind, "analyzer", false);
        validateTextPresence(taskManagerColumns.kind, "language-discovery", false);
        clearAllFilters();

        // Filter by Created By
        TaskManager.applyAndValidateFilter(taskFilter.createdBy, "admin");
        validateTextPresence(taskManagerColumns.createdBy, "admin");
        clearAllFilters();

        // Negative test, filtering by not existing data
        TaskManager.applyAndValidateFilter(taskFilter.applicationName, randomWordGenerator(6));
        cy.get(trTag).should("contain", "No results found");
        clearAllFilters();
    });

    it("Sorting tasks", function () {
        TaskManager.open();
        sortByList.forEach((column) => {
            validateSortBy(column);
        });
    });

    it("Pagination validation", function () {
        TaskManager.open(10);
        validatePagination();
    });

    after("Perform test data clean up", function () {
        cy.reload();
        cy.log("Deleting app list");
        deleteByList(applicationsList);
    });
});
