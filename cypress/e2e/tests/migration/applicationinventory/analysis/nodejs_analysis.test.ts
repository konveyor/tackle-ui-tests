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
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { SEC } from "../../../../types/constants";
import { AnalysisLogView } from "../../../../views/analysis.view";

let applicationsList: Array<Analysis> = [];
describe(["@tier1"], "Nodejs Analysis", () => {
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
        cy.intercept("DELETE", "/hub/application*").as("deleteApplication");
    });

    it("Source analysis on nodejs app", function () {
        const application = new Analysis(
            getRandomApplicationData("nodejsApp_Source", {
                sourceData: this.appData["nodejs-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_nodejsApp"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        cy.wait(2 * SEC);
        application.verifyEffort(this.analysisData["source_analysis_on_nodejsApp"]["effort"]);
        cy.wait(2 * SEC);
        application.validateIssues(this.analysisData["source_analysis_on_nodejsApp"]["issues"]);
        Application.open();
        application.verifyLogContains(AnalysisLogView.mergedLogView, "lspServerName: nodejs");
    });

    after("Perform test data clean up", () => {
        deleteByList(applicationsList);
    });
});
