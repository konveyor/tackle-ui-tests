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
    getRandomAnalysisData,
    deleteByList,
    clearAllFilters,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { SEC, filterIssue } from "../../../../types/constants";
let applicationsList: Array<Analysis> = [];
let application: Analysis;

describe(["@tier2"], "1 Bug: Single application issues filtering", () => {
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
    });

    it("Running analysis and filtering issues by category", function () {
        application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");

        application.validateIssueFilter(
            this.analysisData["source_analysis_on_bookserverapp"]["issues"],
            filterIssue.category,
            "category"
        );
        clearAllFilters();
    });

    it("Bug MTA-1779 - Filtering issues by source", function () {
        application.validateIssueFilter(
            this.analysisData["source_analysis_on_bookserverapp"]["issues"],
            filterIssue.source,
            "source"
        );
        clearAllFilters();
    });

    it("Filtering issues by target", function () {
        application.validateIssueFilter(
            this.analysisData["source_analysis_on_bookserverapp"]["issues"],
            filterIssue.target,
            "targets"
        );
        clearAllFilters();
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
    });
});
