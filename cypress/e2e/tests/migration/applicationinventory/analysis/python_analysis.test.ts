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

let applicationsList: Array<Analysis> = [];
describe(["@tier1"], "Python app analysis", () => {
    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
        cy.intercept("DELETE", "/hub/application*").as("deleteApplication");
    });
    it("Source analysis on python application", function () {
        const application = new Analysis(
            getRandomApplicationData("pythonApp_Source", {
                sourceData: this.appData["python-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_pythonApp"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(this.analysisData["source_analysis_on_pythonApp"]["effort"]);
        application.validateIssues(this.analysisData["source_analysis_on_pythonApp"]["issues"]);
    });

    after("Perform test data clean up", () => {
        deleteByList(applicationsList);
    });
});
