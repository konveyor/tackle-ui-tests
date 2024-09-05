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
import { TaskFilter, trTag } from "../../../types/constants";
import { TaskManagerColumns } from "../../../views/taskmanager.view";

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

    it("Filtering tasks", function () {
        // Analyzing daytrader app for pagination test to generate issues more than 10.
        const dayTraderApp = applicationsList[1];

        Analysis.analyzeAll(dayTraderApp);
        TaskManager.open();
        // Filter by status
        TaskManager.applyFilter(TaskFilter.status, "Pending");
        validateTextPresence(TaskManagerColumns.status, "Pending");
        validateTextPresence(TaskManagerColumns.status, "Running", false);
        validateTextPresence(TaskManagerColumns.status, "Succeeded", false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.status, "Running");
        validateTextPresence(TaskManagerColumns.status, "Running");
        validateTextPresence(TaskManagerColumns.status, "Pending", false);
        validateTextPresence(TaskManagerColumns.status, "Succeeded", false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.status, "Succeeded");
        validateTextPresence(TaskManagerColumns.status, "Succeeded");
        validateTextPresence(TaskManagerColumns.status, "Running", false);
        validateTextPresence(TaskManagerColumns.status, "Pending", false);
        clearAllFilters();

        // Filter by ID
        TaskManager.applyFilter(TaskFilter.id, "1");
        validateNumberPresence(TaskManagerColumns.id, 1);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.id, "2");
        validateNumberPresence(TaskManagerColumns.id, 2);
        clearAllFilters();

        // Filter by Applications
        TaskManager.applyFilter(TaskFilter.applicationName, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name, false);
        validateTextPresence(TaskManagerColumns.kind, "analyzer");
        validateTextPresence(TaskManagerColumns.kind, "language-discovery");
        validateTextPresence(TaskManagerColumns.kind, "tech-discovery");
        validateTextPresence(TaskManagerColumns.status, "Running");
        validateTextPresence(TaskManagerColumns.status, "Succeeded");
        clearAllFilters();

        TaskManager.applyFilter(TaskFilter.applicationName, applicationsList[1].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name);
        validateTextPresence(TaskManagerColumns.kind, "analyzer");
        validateTextPresence(TaskManagerColumns.kind, "language-discovery");
        validateTextPresence(TaskManagerColumns.kind, "tech-discovery");
        clearAllFilters();

        // Filter by Kind
        TaskManager.applyFilter(TaskFilter.kind, "analyzer");
        validateTextPresence(TaskManagerColumns.kind, "analyzer");
        validateTextPresence(TaskManagerColumns.kind, "language-discovery", false);
        validateTextPresence(TaskManagerColumns.kind, "tech-discovery", false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.kind, "language-discovery");
        validateTextPresence(TaskManagerColumns.kind, "language-discovery");
        validateTextPresence(TaskManagerColumns.kind, "analyzer", false);
        validateTextPresence(TaskManagerColumns.kind, "tech-discovery", false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.kind, "tech-discovery");
        validateTextPresence(TaskManagerColumns.kind, "tech-discovery");
        validateTextPresence(TaskManagerColumns.kind, "analyzer", false);
        validateTextPresence(TaskManagerColumns.kind, "language-discovery", false);
        clearAllFilters();

        // Filter by Created By
        TaskManager.applyFilter(TaskFilter.createdBy, "admin");
        validateTextPresence(TaskManagerColumns.createdBy, "admin");
        clearAllFilters();

        // Negative test, filtering by not existing data
        TaskManager.applyFilter(TaskFilter.applicationName, randomWordGenerator(6));
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
        deleteByList(applicationsList);
    });
});
