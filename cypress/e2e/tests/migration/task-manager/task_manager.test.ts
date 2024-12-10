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
    clearAllFilters,
    deleteApplicationTableRows,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    notExists,
    validateTextPresence,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../models/migration/applicationinventory/application";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { TaskKind, TaskStatus } from "../../../types/constants";
import { TaskManagerColumns, tasksTable } from "../../../views/taskmanager.view";

let applicationsList: Array<Analysis> = [];
let application: Analysis;

describe(["@tier1"], "Task Manager", () => {
    before("Login", function () {
        login();
        deleteApplicationTableRows();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Navigation to the task manager page is allowed from the left navigation menu", function () {
        for (let i = 0; i < 2; i++) {
            application = new Analysis(
                getRandomApplicationData("", {
                    sourceData: this.appData["bookserver-app"],
                }),
                getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
            );
            application.create();
            cy.wait("@getApplication");
            cy.wait(2000);
            applicationsList.push(application);
        }

        TaskManager.open();
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name);
    });

    it("Navigation to the task manager page is allowed from the application table", function () {
        applicationsList[0].openAllTasksLink();
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name, false);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery);
        clearAllFilters();
    });

    it("Delete an application - related tasks are deleted", function () {
        // Remove the last element from applicationsList
        const app = applicationsList.pop();
        app.delete();
        TaskManager.open();
        notExists(app.name, tasksTable);
    });

    after("Perform test data clean up", function () {
        cy.wait(2000);
        Application.open(true);
        deleteByList(applicationsList);
    });
});
