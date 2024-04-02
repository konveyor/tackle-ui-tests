import {
    click,
    clickByText,
    getUrl,
    inputText,
    performWithin,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    validateAnyNumberPresence,
    validateNumberPresence,
    validateTextPresence,
    waitUntilSpinnerIsGone,
} from "../../../../../utils/utils";
import {
    button,
    issueFilter,
    migration,
    SEC,
    singleApplication,
    trTag,
} from "../../../../types/constants";
import { navMenu } from "../../../../views/menu.view";
import {
    issueColumns,
    searchMenuToggle,
    singleAppDropList,
    singleApplicationColumns,
} from "../../../../views/issue.view";
import { AppIssue } from "../../../../types/types";
import { div, liTag, searchButton, searchInput, span } from "../../../../views/common.view";

export class Issues {
    /** Contains URL of issues web page */
    static fullUrl = Cypress.env("tackleUrl") + "/issues";

    public static openList(itemsPerPage = 100, forceReload = false): void {
        if (forceReload) {
            cy.visit(Issues.fullUrl);
        }
        if (!getUrl().includes(Issues.fullUrl)) {
            selectUserPerspective(migration);
        }
        clickByText(navMenu, "Issues");
        cy.wait(2 * SEC);
        waitUntilSpinnerIsGone();
        selectItemsPerPage(itemsPerPage);
    }

    public static openSingleApplication(applicationName: string): void {
        Issues.openList();
        clickByText(button, singleApplication);
        click(singleAppDropList);
        clickByText(button, applicationName);
    }

    public static validateFilter(issue: AppIssue, isSingle = false): void {
        cy.contains(issue.name)
            .closest(trTag)
            .within(() => {
                validateTextPresence(issueColumns.issue, issue.name);
                validateTextPresence(issueColumns.category, issue.category);
                validateTextPresence(issueColumns.source, issue.source);
                cy.get(issueColumns.target).within(() => {
                    issue.targets.forEach((currentTarget) => {
                        validateTextPresence(liTag, currentTarget);
                    });
                });
                validateNumberPresence(issueColumns.effort, issue.effort);
                if (!isSingle) {
                    validateAnyNumberPresence(issueColumns.applications);
                } else {
                    validateAnyNumberPresence(singleApplicationColumns.files);
                }
            });
    }

    public static applyFilter(
        filterType: issueFilter,
        filterValue: string,
        isSingle = false
    ): void {
        let selector = "";
        if (!isSingle) {
            Issues.openList();
        }

        selectFilter(filterType);
        const isApplicableFilter =
            filterType === issueFilter.appName ||
            filterType === issueFilter.category ||
            filterType === issueFilter.source ||
            filterType === issueFilter.target;

        if (isApplicableFilter) {
            inputText(searchInput, filterValue);
            click(searchButton);
        } else {
            selector = searchMenuToggle;
            click(selector);
            clickByText(span, filterValue);
            click(selector);
        }
    }

    public static unfold(name: string): void {
        performWithin(name, () => {
            cy.get("[id^=expandable]").then(($button) => {
                if (!$button.hasClass("pf-m-expanded")) {
                    $button.trigger("click");
                }
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
        Issues.validateSection(sections.totalAffectedApps, button, /\d - View affected /);
        Issues.validateSection(sections.targetTechnologies, span, issue.targets);
        Issues.validateSection(sections.sourceTechnologies, div, issue.source);
        Issues.validateSection(sections.ruleSet, div, issue.ruleSet);
        Issues.validateSection(sections.rule, div, issue.rule);
        Issues.validateSection(sections.labels, div, issue.labels);
    }

    private static validateSection(
        title: string | RegExp,
        contentSelector: string,
        content: string | string[] | RegExp
    ): void {
        cy.contains("h4", title)
            .next("div")
            .within(() => {
                if (Array.isArray(content)) {
                    content.forEach((item) => cy.contains(contentSelector, item));
                } else {
                    cy.contains(contentSelector, content);
                }
            });
    }
}
