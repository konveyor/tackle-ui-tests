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
import { AnalysisStatuses, issueFilter, SEC } from "../../../../types/constants";
import { getRandomWord, randomWordGenerator } from "../../../../../utils/data_utils";

describe(["@tier3"], "Filtering, sorting and pagination in Issues", function () {
    let applicationsList: Array<Analysis> = [];
    let businessService: BusinessServices;
    let archetype: Archetype;
    let stakeholders: Stakeholders[];
    let stakeholderGroups: Stakeholdergroups[];
    let tags: Tag[];
    let tagNames: string[];
    const sortByList = ["Issue", "Category", "Effort", "Affected applications"];

    before("Login", function () {
        login();
        cy.intercept("GET", "/hub/application*").as("getApplication");

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
            cy.wait("@getApplication");
            const dayTraderApp = new Analysis(
                getRandomApplicationData("daytrader-app", {
                    sourceData: this.appData["daytrader-app"],
                }),
                getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
            );
            dayTraderApp.tags = tagNames;
            dayTraderApp.create();
            cy.wait("@getApplication");

            applicationsList.push(bookServerApp);
            applicationsList.push(dayTraderApp);
        }
        // applicationsList.forEach((application) => {
        //     application.analyze();
        //     cy.wait(2 * SEC);
        //     application.verifyAnalysisStatus("Completed");
        //     application.selectApplication();
        // });
        Analysis.analyzeAll(applicationsList[0]);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);
    });

    it("All issues - Filtering issues by app name", function () {
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
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    sortByList.forEach((column) => {
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

    after("Perform test data clean up", function () {
        archetype.delete();
        deleteByList(applicationsList);
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        businessService.delete();
    });
});
