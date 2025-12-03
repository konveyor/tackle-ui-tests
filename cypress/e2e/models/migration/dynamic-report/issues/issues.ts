import {
    click,
    clickByText,
    getUniqueElementsFromSecondArray,
    performWithin,
    validateAnyNumberPresence,
    validateNumberPresence,
    validateTextPresence,
} from "../../../../../utils/utils";
import { DynamicReports } from "../../../../tests/migration/dynamic-report/dynamic-report";
import { button, issueFilter, tdTag, trTag } from "../../../../types/constants";
import { AppIssue } from "../../../../types/types";
import { div, liTag, span } from "../../../../views/common.view";
import {
    affectedFilesTable,
    issueColumns,
    singleApplicationColumns,
} from "../../../../views/issue.view";

export class Issues extends DynamicReports {
    /** Contains URL of issues web page */
    static urlSuffix = "/issues";
    static menuName = "Issues";

    public static applyAndValidateFilter(
        filterType: issueFilter,
        filterValues: string[],
        issuesExpected: AppIssue[],
        issuesNotExpected?: AppIssue[],
        isSingle = false
    ) {
        filterValues.forEach((value) => {
            Issues.applyFilter(filterType, value, isSingle);
        });
        issuesExpected.forEach((issue) => {
            Issues.validateFilter(issue, isSingle);
        });

        if (issuesNotExpected.length > 0) {
            getUniqueElementsFromSecondArray(issuesExpected, issuesNotExpected).forEach(
                (issue: AppIssue) => {
                    validateTextPresence(issueColumns.issue, issue.name, false);
                }
            );
        }
    }

    public static validateFilter(issue: AppIssue, isSingle = false): void {
        cy.contains(issue.name)
            .closest(trTag)
            .within(() => {
                validateTextPresence(issueColumns.issue, issue.name);
                validateTextPresence(issueColumns.category, issue.category);
                validateTextPresence(issueColumns.source, issue.sources[0]);
                cy.get(issueColumns.target).within(() => {
                    validateTextPresence(liTag, issue.targets[0]);
                    if (issue.targets.length > 1) {
                        clickByText(span, /more/i);
                    }
                });
                validateNumberPresence(issueColumns.effort, issue.effort);
                if (!isSingle) {
                    validateAnyNumberPresence(issueColumns.applications);
                } else {
                    validateAnyNumberPresence(singleApplicationColumns.files);
                }
            });
    }

    /**
     * Iterates through map of issue names and how many times they are expected to be found
     * @param allIssues is the map where a key is an issue name and number is an amount of occurrences.
     */
    public static validateMultiFilter(allIssues: { [key: string]: number }) {
        Object.keys(allIssues).forEach((name) => {
            cy.contains(name)
                .closest(trTag)
                .within(() => {
                    validateTextPresence(issueColumns.issue, name);
                    validateNumberPresence(issueColumns.applications, allIssues[name]);
                });
        });
    }

    public static openAffectedApplications(name: string): void {
        Issues.openList();
        performWithin(name, () => {
            cy.get(issueColumns.applications).within(() => {
                click("a");
            });
        });
    }

    /**
     * Opens the side drawer that contains all the affected files of an issue
     * @param issueName
     */
    public static openAffectedFiles(issueName: string): void {
        performWithin(issueName, () => {
            cy.get(singleApplicationColumns.files).within(() => {
                cy.get(button).click({ force: true });
            });
        });
    }

    /**
     * Opens the dialog of a single file affected by an Issue
     * @param fileName
     * @param issueName
     */
    public static openAffectedFile(fileName: string, issueName?: string): void {
        if (issueName) {
            Issues.openAffectedFiles(issueName);
        }
        cy.get(affectedFilesTable).within(() => {
            cy.contains("Loading").should("not.exist");
            cy.contains(fileName).click();
        });
    }

    public static validateAllFields(issue: AppIssue): void {
        const sections = {
            totalAffectedApps: "Total affected",
            targetTechnologies: "Target technologies",
            sourceTechnologies: "Source technologies",
            ruleSet: "Rule set",
            rule: /^Rule$/,
            labels: "Labels",
        };

        Issues.unfold(issue.name);
        Issues.validateSection(
            issue.name,
            sections.totalAffectedApps,
            button,
            /\d - View affected /
        );
        Issues.validateSection(issue.name, sections.targetTechnologies, div, issue.targets);
        Issues.validateSection(issue.name, sections.sourceTechnologies, div, issue.sources);
        if (issue.ruleSet) {
            Issues.validateSection(issue.name, sections.ruleSet, div, issue.ruleSet);
        }
        Issues.validateSection(issue.name, sections.rule, div, issue.rule);
        Issues.validateSection(issue.name, sections.labels, div, issue.labels);
    }

    private static validateSection(
        name: string,
        title: string | RegExp,
        contentSelector: string,
        content: string | string[] | RegExp
    ): void {
        cy.contains(tdTag, name)
            .parent(trTag)
            .next()
            .contains("h4", title)
            .next()
            .within(() => {
                if (Array.isArray(content)) {
                    content.forEach((item) => cy.contains(contentSelector, item));
                } else {
                    cy.contains(contentSelector, content);
                }
            });
    }
}
