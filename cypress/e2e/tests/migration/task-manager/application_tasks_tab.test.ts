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
    login,
    getRandomApplicationData,
    sidedrawerTab,
    getRandomAnalysisData,
} from "../../../../utils/utils";
import { Application } from "../../../../e2e/models/migration/applicationinventory/application";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";

let application: Analysis;

describe(["@tier2"], "Open Tasks Tab and Verify Tasks", () => {
    before("Login", function () {
        login();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
        cy.intercept("GET", "/api/applications/*").as("getApplication");
    });

    it("Open 'Tasks' tab in the application drawer and verify task kinds", function () {
        application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        cy.wait("@getApplication"); 
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        sidedrawerTab(application.name, "Tasks");
        cy.get("[data-label='Task Kind']").should((tasks) => {
            const taskKinds = tasks.toArray().map(task => task.innerText);
            expect(taskKinds).to.include.members(["language-discovery", "tech-discovery", "analyzer"]);
        });
    });

    afterEach("Clear state", function () {
        Application.open(true);
    });

    after("Perform test data clean up", function () {
        application.delete(); 
    });
});
