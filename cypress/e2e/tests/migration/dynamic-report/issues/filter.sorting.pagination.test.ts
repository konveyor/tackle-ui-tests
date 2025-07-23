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

import * as data from "../../../../../utils/data_utils";
import { randomWordGenerator } from "../../../../../utils/data_utils";
import {
    clearAllFilters,
    clickByText,
    createMultipleBusinessServices,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    getUniqueNamesMap,
    login,
    selectItemsPerPage,
    validatePagination,
    validateSortBy,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import { Issues } from "../../../../models/migration/dynamic-report/issues/issues";
import { AnalysisStatuses, issueFilter, tdTag, trTag } from "../../../../types/constants";
import { AppIssue } from "../../../../types/types";
import { rightSideBar } from "../../../../views/issue.view";

describe(["@tier3"], "Filtering, sorting and pagination in Issues", function () {
    const applicationsList: Analysis[] = [];
    let businessServiceList: BusinessServices[];
    let archetype: Archetype;
    let stakeholders: Stakeholders[];
    let stakeholderGroups: Stakeholdergroups[];
    let tags: Tag[];
    let tagNames: string[];
    const allIssuesSortByList = ["Issue", "Category", "Effort", "Affected applications"];
    const affectedApplicationSortByList = ["Name", "Business service", "Effort", "Incidents"];
    const singleApplicationSortByList = ["Issue", "Category", "Effort", "Affected files"];
    const affectedFilesSortByList = ["File", "Incidents", "Effort"];
    const appAmount = 6;

    before("Login", function () {
        Cypress.session.clearAllSavedSessions();
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        businessServiceList = createMultipleBusinessServices(2);
        tags = createMultipleTags(2);
        tagNames = tags.map((tag) => tag.name);
        archetype = new Archetype(
            data.getRandomWord(8),
            [tagNames[0]],
            [tagNames[1]],
            null,
            stakeholders,
            stakeholderGroups
        );
        archetype.create();
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < appAmount; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp1_" + i, {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
                    );
                    bookServerApp.business = businessServiceList[0].name;
                    applicationsList.push(bookServerApp);
                }
            });
        });

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < appAmount; i++) {
                    const coolstoreApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp2_" + i, {
                            sourceData: appData["coolstore-app"],
                        }),
                        getRandomAnalysisData(analysisData["source+dep_on_coolStore_app"])
                    );
                    coolstoreApp.tags = tagNames;
                    coolstoreApp.business = businessServiceList[1].name;
                    applicationsList.push(coolstoreApp);
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
        cy.intercept("GET", "/hub/analyses/report/rules*").as("getIssues");
        cy.intercept("GET", "hub/analyses/report/issues/applications*").as("getApplications");
    });

    it("All issues - Filtering issues by name", function () {
        // Analyzing Coolstore app for pagination test to generate issues more than 10.
        const bookServerApp = applicationsList[0];
        const coolstoreApp = applicationsList[appAmount];
        const bookServerIssues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        const coolstoreIssues = this.analysisData["source+dep_on_coolStore_app"]["issues"];

        Analysis.analyzeByList(applicationsList);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);

        Issues.openList(100, true);
        Issues.applyAndValidateFilter(
            issueFilter.applicationName,
            [bookServerApp.name],
            bookServerIssues,
            coolstoreIssues
        );
        clearAllFilters();

        Issues.applyAndValidateFilter(
            issueFilter.applicationName,
            [coolstoreApp.name],
            coolstoreIssues,
            bookServerIssues
        );
        clearAllFilters();
    });

    it("All issues - filtering by multiple names", function () {
        const bookServerApp = applicationsList[0];
        const coolstoreApp = applicationsList[6];
        const bookServerIssues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        const coolstoreIssues = this.analysisData["source+dep_on_coolStore_app"]["issues"];

        Issues.applyMultiFilter(issueFilter.applicationName, [
            bookServerApp.name,
            coolstoreApp.name,
        ]);
        Issues.validateMultiFilter(getUniqueNamesMap([bookServerIssues, coolstoreIssues]));
        clearAllFilters();
    });

    it("All issues - Filtering issues by Archetype", function () {
        Issues.applyFilter(issueFilter.archetype, archetype.name);
        this.analysisData["source+dep_on_coolStore_app"]["issues"].forEach((issue: AppIssue) => {
            Issues.validateFilter(issue);
        });
        clearAllFilters();
    });

    it("All issues - Filtering issues by BS", function () {
        Issues.applyFilter(issueFilter.bs, businessServiceList[0].name);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                Issues.validateFilter(issue);
            }
        );
        clearAllFilters();
    });

    it("All issues - Filtering issues by tags", function () {
        tagNames.forEach((currentTag: string) => {
            Issues.applyFilter(issueFilter.tags, currentTag);
            this.analysisData["source+dep_on_coolStore_app"]["issues"].forEach(
                (issue: AppIssue) => {
                    Issues.validateFilter(issue);
                }
            );
            clearAllFilters();
        });
    });

    it("All issues - Filtering issues by category", function () {
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                Issues.applyFilter(issueFilter.category, issue.category);
                Issues.validateFilter(issue);
                clearAllFilters();
            }
        );

        // Negative test, filtering by not existing data
        Issues.applyFilter(issueFilter.category, randomWordGenerator(6));
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    it("All issues - Filtering issues by source", function () {
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                issue.sources.forEach((source) => {
                    Issues.applyFilter(issueFilter.source, source);
                    Issues.validateFilter(issue);
                    clearAllFilters();
                });
            }
        );

        // Negative test, filtering by not existing data
        Issues.applyFilter(issueFilter.source, randomWordGenerator(6));
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    it("All issues - Filtering issues by target", function () {
        let issues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        issues.forEach((issue: AppIssue) => {
            issue.targets.forEach((target: string) => {
                Issues.applyFilter(issueFilter.target, target);
                Issues.validateFilter(issue);
                clearAllFilters();
            });
        });

        // Negative test, filtering by not existing data
        Issues.applyFilter(issueFilter.target, randomWordGenerator(6));
        cy.get(trTag).should("contain", "No data available");
        clearAllFilters();
    });

    allIssuesSortByList.forEach((column) => {
        it(`All issues - Sort issues by ${column}`, function () {
            Issues.openList();
            cy.wait("@getIssues");
            selectItemsPerPage(100);
            cy.wait("@getIssues");
            validateSortBy(column);
        });
    });

    it("All issues - Sorting affected files", function () {
        Issues.openAffectedApplications(
            this.analysisData["source+dep_on_coolStore_app"]["issues"][0]["name"]
        );
        clickByText(tdTag, applicationsList[6].name);
        cy.get(rightSideBar).within(() => {
            affectedFilesSortByList.forEach((column) => {
                validateSortBy(column);
            });
        });
    });

    it("All issues - Pagination validation", function () {
        Issues.openList(10);
        validatePagination();
    });

    affectedApplicationSortByList.forEach((column) => {
        it(`Affected applications - sort by ${column}`, function () {
            Issues.openAffectedApplications(
                this.analysisData["source_analysis_on_bookserverapp"]["issues"][0]["name"]
            );
            cy.wait("@getApplications");
            selectItemsPerPage(100);
            cy.wait("@getApplications");
            validateSortBy(column);
        });
    });

    it("Affected applications - pagination validation", function () {
        Issues.openAffectedApplications(
            this.analysisData["source_analysis_on_bookserverapp"]["issues"][1]["name"]
        );
        validatePagination();
    });

    it("Single application - filtering issues by category", function () {
        Issues.openSingleApplication(applicationsList[0].name);
        selectItemsPerPage(100);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                Issues.applyFilter(issueFilter.category, issue.category, true);
                Issues.validateFilter(issue, true);
                clearAllFilters();
            }
        );
    });

    it("Single application - filtering issues by source", function () {
        Issues.openSingleApplication(applicationsList[0].name);
        selectItemsPerPage(100);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                issue.sources.forEach((source) => {
                    Issues.applyFilter(issueFilter.source, source, true);
                    Issues.validateFilter(issue, true);
                    clearAllFilters();
                });
            }
        );
    });

    it("Single application - filtering issues by target", function () {
        Issues.openSingleApplication(applicationsList[0].name);
        selectItemsPerPage(100);
        let issues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        issues.forEach((issue: AppIssue) => {
            issue.targets.forEach((target: string) => {
                Issues.applyFilter(issueFilter.target, target, true);
                Issues.validateFilter(issue, true);
                clearAllFilters();
            });
        });
    });

    singleApplicationSortByList.forEach((column) => {
        it(`Single application - sort by ${column}`, function () {
            Issues.openSingleApplication(applicationsList[0].name);
            validateSortBy(column);
        });
    });

    after("Perform test data clean up", function () {
        cy.reload();
        deleteByList(applicationsList);
        archetype.delete();
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        deleteByList(businessServiceList);
    });
});
