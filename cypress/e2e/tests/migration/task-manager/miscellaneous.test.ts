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
    checkSuccessAlert,
    deleteApplicationTableRows,
    deleteCustomResource,
    getNumberOfNonTaskPods,
    getRandomAnalysisData,
    getRandomApplicationData,
    limitPodsByQuota,
    login,
    validateTextPresence,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { TaskKind, TaskStatus } from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { TaskManagerColumns } from "../../../views/taskmanager.view";

describe(["@tier2"], "Actions in Task Manager Page", function () {
    const applicationsList: Analysis[] = [];
    let bookServerApp: Analysis;

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

    it("Test Enable and Disable Preemption", function () {
        // Polarion TC MTA-553
        // Limit pods to the number of tackle pods + 1
        getNumberOfNonTaskPods().then((podsNum) => {
            limitPodsByQuota(podsNum + 1);
        });
        for (let i = 0; i < 2; i++) {
            bookServerApp = new Analysis(
                getRandomApplicationData("TaskApp1_", {
                    sourceData: this.appData["bookserver-app"],
                }),
                getRandomAnalysisData(this.analysisData["analysis_for_openSourceLibraries"])
            );
            bookServerApp.create();
            applicationsList.push(bookServerApp);
        }
        const app = applicationsList[1];
        TaskManager.setPreemption(app.name, TaskKind.languageDiscovery, true);
        checkSuccessAlert(commonView.infoAlertMessage, "Update request submitted.");
        TaskManager.verifyPreemption(app.name, TaskKind.languageDiscovery, true);
        TaskManager.setPreemption(app.name, TaskKind.languageDiscovery, false);
        checkSuccessAlert(commonView.infoAlertMessage, "Update request submitted.", true);
        TaskManager.verifyPreemption(app.name, TaskKind.languageDiscovery, false);
    });

    it("Cancel Task", function () {
        const statusToTest = [TaskStatus.pending, TaskStatus.running, TaskStatus.quotaBlocked];
        Analysis.analyzeAll(bookServerApp);
        TaskManager.open();
        statusToTest.forEach((status) => {
            // Ensure a task with the desired status exists
            cy.get(TaskManagerColumns.status).then(($elements) => {
                const matchingElements = $elements.filter(`:contains("${status}")`);
                if (matchingElements.length) {
                    TaskManager.cancelTask(status);
                    checkSuccessAlert(commonView.infoAlertMessage, "Cancelation request submitted");
                    validateTextPresence(TaskManagerColumns.status, "Canceled");
                } else {
                    cy.log(`Task with status ${status} does not exist`);
                }
            });
        });
        // Succeeded tasks cannot be cancelled.
        TaskManager.cancelTask("Succeeded");
    });

    after("Perform test data clean up", function () {
        deleteCustomResource("quota", "task-pods");
        deleteApplicationTableRows();
    });
});
