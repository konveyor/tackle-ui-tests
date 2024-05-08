/*
Copyright © 2024 the Konveyor Contributors (https://konveyor.io/)

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
import { AnalysisStatuses, ReportTypeSelectors } from "../../../../types/constants";
import { singleApplicationColumns } from "../../../../views/issue.view";
import { dependencies, issues, technologies } from "../../../../views/common.view";

/**
 *
 * This test is divided into three suites due to its specific needs.
 * The test must access an external URL, download a report, extract it, and open it locally for further testing.
 *
 * Cypress cannot handle requests to two different hosts within the same test unless using the cy.origin command.
 * However, this command does not allow local files as an origin.
 *
 * Therefore, the only way to dynamically conduct the test is to split it into three parts:
 * 1. Analyze an app, download, and extract the report
 * 2. Conduct tests on the local interface of the report
 * 3. Delete the test data.
 *
 * For this to work, the app's name must be static, as it needs to be shared across all three suites, and random variables would reset after each describe.
 */

const appName = "Downloaded-Report-Test-App";

describe(["@tier2"], "Prepare Downloaded Report", function () {
    it("Download and extract report", function () {
        cy.fixture("application").then(function (appData) {
            cy.fixture("analysis").then(function (analysisData) {
                login();
                cleanupDownloads();
                deleteAllMigrationWaves();
                deleteApplicationTableRows();
                GeneralConfig.enableDownloadReport();
                const app = new Analysis(
                    getRandomApplicationData("SourceApp", {
                        sourceData: appData["bookserver-app"],
                    }),
                    getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
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
    });
});

describe(["@tier2"], "Test Downloaded Report UI", function () {
    beforeEach("Load data", function () {
        cy.then(function () {
            cy.visit(`/cypress/downloads/analysis-report-app-${appName}/index.html`);
        });
    });

    it("Validate Application Menu", function () {
        cy.get('td[data-label="Name"]').should("have.text", appName);
        cy.get('td[data-label="Tags"]').eq(0).click();
        validateTextPresence("td", "EJB XML");
        cy.get('td[data-label="Incidents"]').should("contain.text", "2");
    });

    it("Validate Issues Tab", function () {
        const issueData = {
            name: "File system - Java IO",
            category: "mandatory",
            target: "cloud-readiness",
        };
        cy.contains("a", appName).click();
        cy.contains("button > span", issues).click();
        selectItemsPerPage(100);
        validateTextPresence(singleApplicationColumns.issue, issueData.name);
        validateTextPresence(singleApplicationColumns.category, issueData.category);
        validateTextPresence('td[data-label="Target"]', issueData.target);
    });

    it("Validate Dependencies Tab", function () {
        cy.contains("a", appName).click();
        cy.contains("button > span", dependencies).click();
        selectItemsPerPage(100);
        validateTextPresence('td[data-label="Name"]', "com.fasterxml.classmate");
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

/*describe(["@tier2"], "Delete Downloaded Report Data", function () {
    it("Delete Downloaded Report Data", function () {
        login();
        cleanupDownloads();
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });
});*/

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
