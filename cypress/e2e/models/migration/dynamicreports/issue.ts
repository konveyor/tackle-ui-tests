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
import { button, migration, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { searchButton } from "../../../views/common.view";

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

    public static filterByName(name: string) {
        selectFilter("Application name");
        inputText("#application.name-input", name);
        click(searchButton);
    }

    public static filterByBs(name: string) {
        selectFilter("Business service");
        click("#businessService.name-filter-value-select");
        clickWithinByText("#businessService.name-filter-value-select", button, name);
    }

    public static filterByTag(names: string[]) {
        selectFilter("Tags");
        click("#tag.id-filter-value-select");
        names.forEach((name) => {
            clickWithinByText("#tag.id-filter-value-select", "span", name);
        });
    }
}
