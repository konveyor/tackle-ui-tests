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
    clickWithin,
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
import { SEC, TaskKind, TaskStatus } from "../../../types/constants";
import { taskNotificationBadge } from "../../../views/common.view";
import { TaskManagerColumns, tasksTable } from "../../../views/taskmanager.view";

let applicationsList: Array<Application> = [];

describe(["@tier2"], "Task Manager", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        deleteApplicationTableRows();

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 2; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("bookserverApp", {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
                    );
                    bookServerApp.create();
                    applicationsList.push(bookServerApp);
                }
            });
        });
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Navigation to the task manager page is allowed from the left navigation menu", function () {
        TaskManager.open();
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name);
    });

    it("Navigation to the task manager page is allowed from the application popover", function () {
        applicationsList[0].openAllTasksLink();
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name, false);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.languageDiscovery);
        validateTextPresence(TaskManagerColumns.kind, TaskKind.techDiscovery);
        clearAllFilters();
    });

    it("Validate 'View All Tasks' link from within the task drawer", function () {
        // Automates Polarion TC MTA-557
        cy.get(taskNotificationBadge).click();
        clickWithin(
            "div.pf-v5-c-notification-drawer",
            "div.pf-v5-c-notification-drawer__header-action"
        );
        cy.get("h1", { timeout: 35 * SEC }).should("contain", "Task Manager");
        validateTextPresence(TaskManagerColumns.application, applicationsList[0].name);
        validateTextPresence(TaskManagerColumns.application, applicationsList[1].name);
    });

    it("Create an app with source code and branch name - discovery tasks should succeed", function () {
        Application.open();
        const app = new Application(
            getRandomApplicationData("", {
                sourceData: this.appData["konveyor-exampleapp"],
            })
        );
        app.create();
        cy.wait("@getApplication", { timeout: 2 * SEC });
        applicationsList.push(app);
        TaskManager.open();
        TaskManager.verifyTaskStatus(app.name, TaskKind.languageDiscovery, TaskStatus.succeeded);
        TaskManager.verifyTaskStatus(app.name, TaskKind.techDiscovery, TaskStatus.succeeded);
    });

    it("Create a binary app - no discovery task is triggered", function () {
        Application.open();
        const app = new Application(
            getRandomApplicationData("binary", {
                sourceData: this.appData["tackle-testapp-binary"],
            })
        );
        app.create();
        cy.wait("@getApplication", { timeout: 5 * SEC });
        applicationsList.push(app);
        TaskManager.open();
        notExists(app.name, tasksTable);
    });

    it("Delete an application - related tasks are deleted", function () {
        // Remove the last element from applicationsList
        const app = applicationsList.pop();
        app.delete();
        TaskManager.open();
        notExists(app.name, tasksTable);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationsList);
    });
});
