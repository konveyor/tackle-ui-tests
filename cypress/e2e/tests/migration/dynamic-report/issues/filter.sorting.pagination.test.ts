import {
    clearAllFilters,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validatePagination,
    validateSortBy,
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import * as data from "../../../../../utils/data_utils";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Tag } from "../../../../models/migration/controls/tags";
import { Issues } from "../../../../models/migration/dynamic-report/issues/issues";
import { AppIssue } from "../../../../types/types";
import { AnalysisStatuses, issueFilter, SEC, trTag } from "../../../../types/constants";
import { getRandomWord, randomWordGenerator } from "../../../../../utils/data_utils";

describe(["@tier3"], "Filtering, sorting and pagination in Issues", function () {
    let applicationsList: Array<Analysis> = [];
    let dayTraderAppList: Array<Analysis> = [];
    let bookServerAppList: Array<Analysis> = [];
    let businessService: BusinessServices;
    let archetype: Archetype;
    let stakeholders: Stakeholders[];
    let stakeholderGroups: Stakeholdergroups[];
    let tags: Tag[];
    let tagNames: string[];
    const allIssuesSortByList = ["Issue", "Category", "Effort", "Affected applications"];
    const affectedApplicationSortByList = ["Name", "Business serice", "Effort", "Incidents"];
    const singleApplicationSortByList = ["Issue", "Category", "Effort", "Affected files"];

    before("Login", function () {
        login();

        businessService = new BusinessServices(data.getCompanyName(), data.getDescription());
        businessService.create();
        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
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
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Preparing applications before running actually tests", function () {
        for (let i = 0; i < 6; i++) {
            const bookServerApp = new Analysis(
                getRandomApplicationData(getRandomWord(8), {
                    sourceData: this.appData["bookserver-app"],
                }),
                getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
            );
            bookServerApp.business = businessService.name;
            bookServerApp.create();
            bookServerAppList.push(bookServerApp);
            const dayTraderApp = new Analysis(
                getRandomApplicationData("daytrader-app", {
                    sourceData: this.appData["daytrader-app"],
                }),
                getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
            );
            dayTraderApp.tags = tagNames;
            dayTraderApp.create();
            dayTraderAppList.push(dayTraderApp);

            applicationsList.push(bookServerApp);
            applicationsList.push(dayTraderApp);
        }
        cy.wait(5 * SEC);
        // Analysis.analyzeAll(applicationsList[1]);
        Analysis.analyzeByList(dayTraderAppList);
        Analysis.analyzeByList(bookServerAppList);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);
    });

    it("All issues - Filtering issues by app name", function () {
        Issues.openList(10, true);
        Issues.applyFilter(issueFilter.appName, applicationsList[0].name);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                Issues.validateFilter(issue);
            }
        );
        clearAllFilters();

        // Negative test, filtering by not existing data
        Issues.applyFilter(issueFilter.appName, randomWordGenerator(6));
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    it("All issues - Filtering issues by Archetype", function () {
        Issues.applyFilter(issueFilter.archetype, archetype.name);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                Issues.validateFilter(issue);
            }
        );
        clearAllFilters();
    });

    it("All issues - Filtering issues by BS", function () {
        Issues.applyFilter(issueFilter.bs, businessService.name);
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
            this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
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
                Issues.applyFilter(issueFilter.source, issue.source);
                Issues.validateFilter(issue);
                clearAllFilters();
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
        it(`${
            column == "Issue" ? "BUG MTA-2067 - " : ""
        }All issues - Sort issues by ${column}`, function () {
            Issues.openList();
            validateSortBy(column);
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
            validateSortBy(column);
        });
    });

    it("Affected applications - pagination validation", function () {
        Issues.openAffectedApplications(
            this.analysisData["source_analysis_on_bookserverapp"]["issues"][0]["name"]
        );
        validatePagination();
    });

    it("Single application - filtering issues by category", function () {
        Issues.openSingleApplication(applicationsList[0].name);
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
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (issue: AppIssue) => {
                Issues.applyFilter(issueFilter.source, issue.source, true);
                Issues.validateFilter(issue, true);
                clearAllFilters();
            }
        );
    });

    it("Single application - filtering issues by target", function () {
        Issues.openSingleApplication(applicationsList[0].name);
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

    it("Perform test data clean up", function () {
        archetype.delete();
        deleteByList(applicationsList);
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        businessService.delete();
    });
});
