import {
    click,
    clickByText,
    filterIssueBy,
    getUrl,
    selectItemsPerPage,
    selectUserPerspective,
    validateTextPresence,
} from "../../../../../utils/utils";
import {
    button,
    filterIssue,
    migration,
    SEC,
    singleApplication,
} from "../../../../types/constants";
import { navMenu } from "../../../../views/menu.view";
import { singleAppDropList, singleApplicationColumns } from "../../../../views/issue.view";
import { AppIssue } from "../../../../types/types";

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

    public static validateFilter(
        issues: AppIssue[],
        filterType: filterIssue,
        filterValue: string
    ): void {
        issues.forEach((issue: AppIssue) => {
            const isApplicableFilter =
                filterType === filterIssue.tags ||
                filterType === filterIssue.category ||
                filterType === filterIssue.source ||
                filterType === filterIssue.target;

            if (isApplicableFilter) {
                filterValue = issue[filterValue];
            }
            Issues.openList();
            filterIssueBy(filterType, filterValue);
            cy.get("tr").should("not.contain", "No data available");
            validateTextPresence(singleApplicationColumns.issue, issue["name"]);
        });
    }
}
