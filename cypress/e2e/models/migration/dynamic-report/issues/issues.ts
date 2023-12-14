import {
    click,
    clickByText,
    getUrl,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    validateAnyNumberPresence,
    validateNumberPresence,
    validateTextPresence,
} from "../../../../../utils/utils";
import {
    button,
    issueFilter,
    migration,
    SEC,
    singleApplication,
    tdTag,
    trTag,
} from "../../../../types/constants";
import { navMenu } from "../../../../views/menu.view";
import {
    archetypeFilterName,
    bsFilterName,
    issueColumns,
    singleAppDropList,
    singleApplicationColumns,
    tagFilterName,
} from "../../../../views/issue.view";
import { AppIssue } from "../../../../types/types";
import { liTag, searchButton, searchInput, span } from "../../../../views/common.view";

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
            if (filterType == issueFilter.bs) {
                selector = bsFilterName;
            } else if (filterType == issueFilter.tags) {
                selector = tagFilterName;
            } else if (filterType == issueFilter.archetype) {
                selector = archetypeFilterName;
            }
            click(selector);
            clickByText(span, filterValue);
            click(selector);
        }
    }

    public static unfold(name: string) {
        cy.contains(tdTag, name)
            .closest(trTag)
            .within(() => {
                cy.get("[id^=expandable]").then(($button) => {
                    if (!$button.hasClass("pf-m-expanded")) {
                        $button.trigger("click");
                    }
                });
            });
    }
}
