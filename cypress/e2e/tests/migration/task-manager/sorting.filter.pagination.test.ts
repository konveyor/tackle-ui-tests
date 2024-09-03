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
    deleteApplicationTableRows,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateSortBy,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { AnalysisStatuses } from "../../../types/constants";

describe(["@tier3"], "Filtering, sorting and pagination in Task Manager Page", function () {
    const applicationsList: Analysis[] = [];
    const sortByList = ["ID", "Application", "Status", "Kind", "Priority", "Created By"];

    before("Login", function () {
        login();
        deleteApplicationTableRows();
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 6; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp1_" + i, {
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
                for (let i = 0; i < 6; i++) {
                    const dayTraderApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp2_" + i, {
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

    it("Filtering tasks by ID", function () {
        // Analyzing daytrader app for pagination test to generate issues more than 10.
        const bookServerApp = applicationsList[0];
        const dayTraderApp = applicationsList[6];
        const bookServerIssues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        const dayTraderIssues = this.analysisData["source+dep_analysis_on_daytrader-app"]["issues"];

        Analysis.analyzeAll(dayTraderApp);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);
    });

    it("Sorting all tasks", function () {
        TaskManager.open();
        sortByList.forEach((column) => {
            validateSortBy(column);
        });
    });

    after("Perform test data clean up", function () {
        cy.reload();
        cy.log("Deleting app list");
        deleteByList(applicationsList);
    });
});
