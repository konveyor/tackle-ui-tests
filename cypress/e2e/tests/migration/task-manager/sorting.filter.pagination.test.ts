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
    deleteCustomResource,
    getNumberOfNonTaskPods,
    getRandomAnalysisData,
    getRandomApplicationData,
    limitPodsByQuota,
    login,
    validateNumberPresence,
    validatePagination,
    validateSortBy,
    validateTextPresence,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { SEC, TaskFilter, TaskKind, TaskStatus, trTag } from "../../../types/constants";
import { TaskManagerColumns, TaskManagerTableHeaders } from "../../../views/taskmanager.view";

describe(["@tier3"], "Filtering, sorting and pagination in Task Manager Page", function () {
    const applicationsList: Analysis[] = [];

    before("Login", function () {
        login();
        cy.visit("/");
        deleteApplicationTableRows();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Bug MTA-5739: Sorting tasks", function () {
        // Ensure total pod count does not exceed the number of tackle pods.
        getNumberOfNonTaskPods().then((podsNum) => {
            limitPodsByQuota(podsNum);
        });

        let bookServerApp: Analysis;
        for (let i = 0; i < 6; i++) {
            bookServerApp = new Analysis(
                getRandomApplicationData("TaskFilteringApp_" + i, {
                    sourceData: this.appData["bookserver-app"],
                }),
                getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
            );
            applicationsList.push(bookServerApp);
        }
        applicationsList.forEach((application) => application.create());
        Analysis.analyzeAll(bookServerApp);

        TaskManager.open(100);
        cy.wait(5 * SEC);
        const columsToTest = [
            TaskManagerTableHeaders.id,
            TaskManagerTableHeaders.application,
            TaskManagerTableHeaders.kind,
            TaskManagerTableHeaders.priority,
            TaskManagerTableHeaders.createdBy,
            TaskManagerTableHeaders.status,
        ];
        columsToTest.forEach((column) => {
            validateSortBy(column);
        });
    });

    // Making sure Resource Quota CR is deleted
    it("Delete resource quota created in previous test", function () {
        deleteCustomResource("quota", "task-pods");
    });

    it("Filtering tasks", function () {
        TaskManager.open();
        cy.intercept("GET", "/hub/tasks*").as("getTasks");

        // Filter by status
        TaskManager.applyFilter(TaskFilter.status, TaskStatus.pending);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.pending);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.running, false);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.succeeded, false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.status, TaskStatus.running);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.running);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.pending, false);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.succeeded, false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.status, TaskStatus.succeeded);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.succeeded);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.running, false);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.pending, false);
        clearAllFilters();

        // Filter by ID
        cy.wait("@getTasks")
            .its("response.body")
            .should("have.length.gte", 2) // Make sure there are at least two items
            .then((responseBody) => {
                TaskManager.applyFilter(TaskFilter.id, responseBody[0].id.toString());
                validateNumberPresence(TaskManagerColumns.id, responseBody[0].id);
                validateTextPresence(TaskManagerColumns.id, responseBody[1].id.toString(), false);
                clearAllFilters();
            });

        // Filter by Applications
        TaskManager.applyFilter(TaskFilter.applicationName, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name, false);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.analyzer);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.running);
        validateTextPresence(TaskManagerColumns.status, TaskStatus.succeeded);
        clearAllFilters();

        TaskManager.applyFilter(TaskFilter.applicationName, applicationsList[1].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.analyzer);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery);
        clearAllFilters();

        // Filter by Kind
        TaskManager.applyFilter(TaskFilter.kind, TaskKind.analyzer);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.analyzer);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery, false);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery, false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.kind, TaskKind.languageDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.analyzer, false);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery, false);
        clearAllFilters();
        TaskManager.applyFilter(TaskFilter.kind, TaskKind.techDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.analyzer, false);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery, false);
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

    it("Pagination validation", function () {
        TaskManager.open(10, true);
        validatePagination();
    });

    after("Perform test data clean up", function () {
        cy.reload();
        deleteByList(applicationsList);
    });
});
