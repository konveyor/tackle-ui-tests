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

describe(["@tier2"], "Enable Premeption in Task Manager Page", function () {
    const applicationsList: Analysis[] = [];

    before("Login", function () {
        login();
        deleteApplicationTableRows();
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 4; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("TaskFilteringApp1_" + i, {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["analysis_for_openSourceLibraries"])
                    );
                    applicationsList.push(bookServerApp);
                }
                applicationsList.forEach((application) => application.create());
            });
        });
    });

    it("Test Enable and Disable Premeption", function () {
        TaskManager.setPreemption(true);
        checkSuccessAlert(commonView.infoAlertMessage, "Update request submitted.");
        validateTextPresence(TaskManagerColumns.preemption, "true");
        TaskManager.setPreemption(false);
        checkSuccessAlert(commonView.infoAlertMessage, "Update request submitted.");
        validateTextPresence(TaskManagerColumns.preemption, "false");
    });
});
