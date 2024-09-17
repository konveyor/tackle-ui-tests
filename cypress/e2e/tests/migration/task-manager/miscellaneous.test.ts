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
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateTextPresence,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { TaskManagerColumns } from "../../../views/taskmanager.view";
import * as commonView from "../../../views/common.view";

describe(["@tier2"], "Actions in Task Manager Page", function () {
    const applicationsList: Analysis[] = [];

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
    });

    it("Test Enable and Disable Premeption", function () {
        const bookServerApp = new Analysis(
            getRandomApplicationData("TaskApp1_", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_openSourceLibraries"])
        );
        bookServerApp.create();
        TaskManager.setPreemption(true);
        checkSuccessAlert(commonView.infoAlertMessage, "Update request submitted.");
        validateTextPresence(TaskManagerColumns.preemption, "true");
        TaskManager.setPreemption(false);
        checkSuccessAlert(commonView.infoAlertMessage, "Update request submitted.");
        validateTextPresence(TaskManagerColumns.preemption, "false");
    });

    it("Cancel Task", function () {
        const bookServerApp = new Analysis(
            getRandomApplicationData("TaskApp1_", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_openSourceLibraries"])
        );
        bookServerApp.create();
        TaskManager.cancelTask("Pending");
        checkSuccessAlert(commonView.infoAlertMessage, "Cancelation request submitted");
        validateTextPresence(TaskManagerColumns.status, "Canceled");
        TaskManager.cancelTask("Running");
        checkSuccessAlert(commonView.infoAlertMessage, "Cancelation request submitted");
        validateTextPresence(TaskManagerColumns.status, "Canceled");
        // Succeeded tasks cannot be cancelled.
        TaskManager.cancelTask("Succeeded");
    });
});
