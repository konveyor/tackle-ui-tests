import {
    clickByText,
    getUrl,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import { migration, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";

export class Issue {
    /** Contains URL of issues web page */
    static fullUrl = Cypress.env("tackleUrl") + "/issues";

    public static openList(itemsPerPage = 100, forceReload = false): void {
        if (forceReload) {
            cy.visit(Issue.fullUrl);
        }
        if (!getUrl().includes(Issue.fullUrl)) {
            selectUserPerspective(migration);
            clickByText(navMenu, "Issues");
            cy.wait(2 * SEC);
        }
        selectItemsPerPage(itemsPerPage);
    }
}
