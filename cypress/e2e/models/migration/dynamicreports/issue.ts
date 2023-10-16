import {
    click,
    clickByText,
    clickWithinByText,
    getUrl,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import { button, filterIssue, migration, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { searchButton } from "../../../views/common.view";
import {
    appFilterName,
    bsFilterName,
    categoryFilterName,
    sourceFilterName,
    tagFilterName,
    targetFilterName,
} from "../../../views/issue.view";

export class Issue {
    /** Contains URL of issues web page */
    static fullUrl = Cypress.env("tackleUrl") + "/issues";

    public static openList(itemsPerPage = 100, forceReload = false): void {
        if (forceReload) {
            cy.visit(Issue.fullUrl);
        }
        if (!getUrl().includes(Issue.fullUrl)) {
            selectUserPerspective(migration);
        }
        clickByText(navMenu, "Issues");
        cy.wait(2 * SEC);
        selectItemsPerPage(itemsPerPage);
    }

    public static filterBy(item: string, itemName: string | string[]) {
        let selector: string;
        selectFilter(item);
        if (
            item == filterIssue.appName ||
            item == filterIssue.category ||
            item == filterIssue.source ||
            item == filterIssue.target
        ) {
            if (item == filterIssue.appName) selector = appFilterName;
            if (item == filterIssue.category) selector = categoryFilterName;
            if (item == filterIssue.source) selector = sourceFilterName;
            if (item == filterIssue.target) selector = targetFilterName;
            inputText(selector, itemName);
            click(searchButton);
        } else if (item == filterIssue.bs && !Array.isArray(itemName)) {
            click(bsFilterName);
            clickWithinByText(bsFilterName, button, itemName);
        } else if (item == filterIssue.tags && Array.isArray(itemName)) {
            click(tagFilterName);
            itemName.forEach((name) => {
                clickWithinByText(tagFilterName, "span", name);
            });
        }
    }
}
