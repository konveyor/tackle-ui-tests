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
import { searchButton, span } from "../../../views/common.view";
import {
    appFilterName,
    bsFilterName,
    categoryFilterName,
    sourceFilterName,
    tagFilterName,
    targetFilterName,
} from "../../../views/issue.view";

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

    public static filterBy(item: string, itemName: string | string[]): void {
        //TODO: Refactor this after bug https://issues.redhat.com/browse/MTA-1465 will be fixed
        const selectorMap: Record<string, string> = {
            [filterIssue.appName]: appFilterName,
            [filterIssue.category]: categoryFilterName,
            [filterIssue.source]: sourceFilterName,
            [filterIssue.target]: targetFilterName,
        };

        Issues.openList();
        selectFilter(item);
        if (selectorMap[item]) {
            inputText(selectorMap[item], itemName);
            click(searchButton);
        } else if (item == filterIssue.bs && !Array.isArray(itemName)) {
            click(bsFilterName);
            clickWithinByText(bsFilterName, button, itemName);
        } else if (item == filterIssue.tags && Array.isArray(itemName)) {
            click(tagFilterName);
            itemName.forEach((name) => {
                clickWithinByText(tagFilterName, span, name);
            });
        }
    }
}
