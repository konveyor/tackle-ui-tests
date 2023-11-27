import {
    click,
    clickByText,
    getUrl,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    validateTextPresence,
} from "../../../../utils/utils";
import { button, filterIssue, migration, SEC, singleApplication } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { searchButton, span } from "../../../views/common.view";
import {
    bsFilterName,
    searchInput,
    singleAppDropList,
    singleAppLabels,
    tagFilterName,
} from "../../../views/issue.view";
import { AppIssue } from "../../../types/types";

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

    public static filterBy(filterType: filterIssue, item: string | string[]): void {
        let selector = "";
        Issues.openList();
        selectFilter(filterType);
        const isApplicableFilter =
            filterType === filterIssue.appName ||
            filterType === filterIssue.category ||
            filterType === filterIssue.source ||
            filterType === filterIssue.target;

        if (isApplicableFilter) {
            inputText(searchInput, item);
            click(searchButton);
        } else {
            if (filterType == filterIssue.bs) {
                selector = bsFilterName;
            } else if (filterType == filterIssue.tags) {
                selector = tagFilterName;
            }
            click(selector);
            if (Array.isArray(item)) {
                item.forEach((name) => {
                    clickByText(span, name);
                });
            } else {
                clickByText(span, item);
            }
            click(selector);
        }
    }

    public static validateFilter(issues: AppIssue[], filterType: filterIssue, item: string): void {
        issues.forEach((issue: AppIssue) => {
            if (filterType === filterIssue.tags || filterType === filterIssue.source) {
                Issues.filterBy(filterType, issue[item]);
            } else {
                Issues.filterBy(filterType, item);
            }
            cy.get("tr").should("not.contain", "No data available");
            validateTextPresence(singleAppLabels.issue, issue["name"]);
        });
    }
}
