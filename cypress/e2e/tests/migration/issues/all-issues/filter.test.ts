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
    validateTextPresence,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { SEC, filterIssue } from "../../../../types/constants";
import { Issues } from "../../../../models/migration/issues/issues";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import * as data from "../../../../../utils/data_utils";
import { singleAppLabels } from "../../../../views/issue.view";
let applicationsList: Array<Analysis> = [];
let appBusinessService: BusinessServices;

describe(["@tier2"], "Issues filtering", () => {
    before("Login", function () {
        login();
        appBusinessService = new BusinessServices(data.getCompanyName(), data.getDescription());
        appBusinessService.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Running analysis and filtering issues by app name", function () {
        const application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.business = appBusinessService.name;
        application.create();
        applicationsList.push(application);
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");

        Issues.filterBy(filterIssue.appName, application.name);
        cy.get("tr").should("not.contain", "No data available");
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: string[]) => {
                validateTextPresence(singleAppLabels.issue, issue["name"]);
            }
        );
        clearAllFilters();
    });

    it("Filtering issues by BS", function () {
        Issues.filterBy(filterIssue.bs, appBusinessService.name);
        cy.get("tr").should("not.contain", "No data available");
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: string[]) => {
                validateTextPresence(singleAppLabels.issue, issue["name"]);
            }
        );
        clearAllFilters();
    });

    it("Filtering issues by tags", function () {
        let issue = this.analysisData["source_analysis_on_bookserverapp"]["issues"][0];
        Issues.filterBy(filterIssue.tags, issue["tags"]);
        cy.get("tr").should("not.contain", "No data available");
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: string[]) => {
                validateTextPresence(singleAppLabels.issue, issue["name"]);
            }
        );
        clearAllFilters();
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
        appBusinessService.delete();
    });
});
