import {
    clearAllFilters,
    clickByText,
    createMultipleBusinessServices,
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
import { AnalysisStatuses, issueFilter, SEC, tdTag, trTag } from "../../../../types/constants";
import { randomWordGenerator } from "../../../../../utils/data_utils";
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

    before("Login", function () {
        login();

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
                for (let i = 0; i < 6; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp1_" + i, {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["analysis_for_openSourceLibraries"])
                    );
                    bookServerApp.business = businessServiceList[0].name;
                    applicationsList.push(bookServerApp);
                }
            });
        });
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 6; i++) {
                    const dayTraderApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp2_" + i, {
                            sourceData: appData["daytrader-app"],
                        }),
                        getRandomAnalysisData(analysisData["source+dep_analysis_on_daytrader-app"])
                    );
                    dayTraderApp.tags = tagNames;
                    dayTraderApp.business = businessServiceList[1].name;
                    applicationsList.push(dayTraderApp);
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
    });

    it("All issues - Filtering issues by name", function () {
        // Analyzing daytrader app for pagination test to generate issues more than 10.
        const bookServerApp = applicationsList[0];
        const dayTraderApp = applicationsList[6];
        const bookServerIssues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        const dayTraderIssues = this.analysisData["source+dep_analysis_on_daytrader-app"]["issues"];

        Analysis.analyzeAll(dayTraderApp);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);

        Issues.openList(100, true);
        Issues.applyAndValidateFilter(
            issueFilter.appName,
            [bookServerApp.name],
            bookServerIssues,
            dayTraderIssues
        );
        clearAllFilters();

        Issues.applyAndValidateFilter(
            issueFilter.appName,
            [dayTraderApp.name],
            dayTraderIssues,
            bookServerIssues
        );
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
            column == "Issue" ? "BUG MTA-2432 - " : ""
        }All issues - Sort issues by ${column}`, function () {
            Issues.openList();
            validateSortBy(column);
        });
    });

    it("All issues - Sorting affected files", function () {
        Issues.openAffectedApplications(
            this.analysisData["source+dep_analysis_on_daytrader-app"]["issues"][0]["name"]
        );
        cy.wait(2 * SEC);
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

    after("Perform test data clean up", function () {
        cy.reload();
        cy.log("Deleting app list");
        deleteByList(applicationsList);
        archetype.delete();
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        deleteByList(businessServiceList);
    });
});
