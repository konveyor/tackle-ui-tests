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
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    taskDetailsSanity,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { AnalysisStatuses, TaskKind } from "../../../../types/constants";

describe(["@tier3"], "Validate task links from application popover", function () {
    let bookServerApp: Analysis;

    before("Login", function () {
        login();
        cy.visit("/");
        deleteApplicationTableRows();
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                bookServerApp = new Analysis(
                    getRandomApplicationData("bookserver", {
                        sourceData: appData["bookserver-app"],
                    }),
                    getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
                );
                bookServerApp.create();
                bookServerApp.analyze();
                bookServerApp.verifyAnalysisStatus(AnalysisStatuses.completed);
            });
        });
    });

    it("Click the tech-discovery link in application popover - task details page should open", function () {
        const taskKind = TaskKind.techDiscovery;
        bookServerApp.openTaskDetailsFromPopover(taskKind);
        taskDetailsSanity(bookServerApp.name, taskKind);
    });

    it("Click the language-discovery link in application popover - task details page should open", function () {
        const taskKind = TaskKind.languageDiscovery;
        bookServerApp.openTaskDetailsFromPopover(taskKind);
        taskDetailsSanity(bookServerApp.name, taskKind);
    });

    it("Click the analyzer link in application popover - task details page should open", function () {
        const taskKind = TaskKind.analyzer;
        bookServerApp.openTaskDetailsFromPopover(taskKind);
        taskDetailsSanity(bookServerApp.name, taskKind);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteApplicationTableRows();
    });
});
