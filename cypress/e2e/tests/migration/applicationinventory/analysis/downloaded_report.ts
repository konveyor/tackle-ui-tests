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
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateTextPresence,
} from "../../../../../utils/utils";
import { GeneralConfig } from "../../../../models/administration/general/generalConfig";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses, ReportTypeSelectors, SEC } from "../../../../types/constants";
import { singleApplicationColumns } from "../../../../views/issue.view";
import { dependencies, issues, technologies } from "../../../../views/common.view";

let app: Analysis;
const appName = "Downloaded-Report-Test-App";

describe(["@tier2"], "Prepare Downloaded Report", () => {
    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Download and extract report", function () {
        login();
        cleanupDownloads();
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        GeneralConfig.enableDownloadReport();

        app = new Analysis(
            getRandomApplicationData("SourceApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        app.name = appName;
        app.create();
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        app.downloadReport(ReportTypeSelectors.HTML);
        cy.task("unzip", {
            path: "cypress/downloads/",
            file: `analysis-report-app-${app.name}.tar`,
        });
        cy.verifyDownload(`analysis-report-app-${app.name}/index.html`);
    });
});

describe(["@tier2"], "Test Downloaded Report UI", () => {
    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.visit(`/cypress/downloads/analysis-report-app-${appName}/index.html`);
    });

    it("Validate Application Menu", function () {
        const issueData = this.analysisData["source_analysis_on_bookserverapp"]["issues"][0];
        cy.get('td[data-label="Name"]').should("have.text", appName);
        cy.get('td[data-label="Tags"]').eq(0).click();
        validateTextPresence("td", "EJB XML");
        cy.get('td[data-label="Incidents"]').should("contain.text", issueData.incidents);
    });

    it("Validate Issues Tab", function () {
        const issueData = this.analysisData["source_analysis_on_bookserverapp"]["issues"][0];
        cy.contains("a", appName).click();
        cy.contains("button > span", issues).click();
        selectItemsPerPage(100);
        validateTextPresence(singleApplicationColumns.issue, issueData.name);
        validateTextPresence(singleApplicationColumns.category, issueData.category);
        validateTextPresence('td[data-label="Target"]', issueData.targets[0]);
    });

    it("Validate Dependencies Tab", function () {
        const dependenciesData =
            this.analysisData["source_analysis_on_bookserverapp"]["dependencies"];
        cy.contains("a", appName).click();
        cy.contains("button > span", dependencies).click();
        selectItemsPerPage(100);
        validateTextPresence('td[data-label="Name"]', dependenciesData[0].name);
    });

    it("Validate Technologies Tab", function () {
        cy.contains("a", appName).click();
        cy.contains("button > span", technologies).click();
        validateTextPresence("article", "EJB XML");
    });

    it("Validate Issues Menu", function () {
        const issueData = this.analysisData["source_analysis_on_bookserverapp"]["issues"][0];
        cy.contains("a", appName).click();
        cy.contains("button > span", issues).click();
        selectItemsPerPage(100);
        validateTextPresence(singleApplicationColumns.issue, issueData.name);
        validateTextPresence(singleApplicationColumns.category, issueData.category);
        validateTextPresence('td[data-label="Target"]', issueData.targets[0]);
    });

    it("Validate Dependencies Menu", function () {
        const dependenciesData =
            this.analysisData["source_analysis_on_bookserverapp"]["dependencies"];
        cy.contains("nav > ul > a", dependencies).click();
        selectItemsPerPage(100);
        validateTextPresence('td[data-label="Name"]', dependenciesData[0].name);
    });
});

describe(["@tier2"], "Delete Downloaded Report Data", function () {
    it("Delete Downloaded Report Data", function () {
        login();
        cleanupDownloads();
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });
});

const selectItemsPerPage = (items: number) => {
    cy.log(`Select ${items} per page`);
    cy.get("#pagination-options-menu-bottom-toggle", { log: false }).then(($toggleBtn) => {
        if ($toggleBtn.eq(0).is(":disabled")) {
            return;
        }
        $toggleBtn.eq(0).trigger("click");
        cy.get(`li > button`, { log: false }).contains(`${items}`).click({
            force: true,
            log: false,
        });
    });
};
