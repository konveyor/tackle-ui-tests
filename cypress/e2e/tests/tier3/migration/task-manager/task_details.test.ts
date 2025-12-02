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
    cleanupDownloads,
    deleteApplicationTableRows,
    downloadTaskDetails,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { TaskKind } from "../../../types/constants";
import { downloadFormatDetails } from "../../../views/common.view";

describe(["@tier3"], "Task details validation", function () {
    let application: Analysis;
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

    it("Open language-discovery details by clicking on the status link", function () {
        application = new Analysis(
            getRandomApplicationData("", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        TaskManager.openTaskDetailsByStatus(application.name, TaskKind.languageDiscovery);
    });

    it("Open tech-discovery details by clicking on the status link", function () {
        TaskManager.openTaskDetailsByStatus(application.name, TaskKind.techDiscovery);
    });

    it("Open task details from right kebab menu", function () {
        TaskManager.openTaskDetailsByKebabMenu(application.name, TaskKind.languageDiscovery);
    });

    it("Download task details in yaml format", function () {
        TaskManager.openTaskDetailsByKebabMenu(application.name, TaskKind.techDiscovery, false);
        downloadTaskDetails();
    });

    it("Download task details in json format", function () {
        TaskManager.openTaskDetailsByKebabMenu(application.name, TaskKind.techDiscovery, false);
        downloadTaskDetails(downloadFormatDetails.json);
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        cleanupDownloads();
    });
});
