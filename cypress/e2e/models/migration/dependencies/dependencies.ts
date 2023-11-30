import {
    click,
    clickByText,
    getUrl,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import { filterDependency, migration, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { AppDependency } from "../../../types/types";
import { searchInput } from "../../../views/issue.view";
import { searchButton } from "../../../views/common.view";

export class Dependencies {
    /** Contains URL of issues web page */
    static fullUrl = Cypress.env("tackleUrl") + "/dependencies";

    public static openList(itemsPerPage = 100, forceReload = false): void {
        if (forceReload) {
            cy.visit(Dependencies.fullUrl);
        }
        if (!getUrl().includes(Dependencies.fullUrl)) {
            selectUserPerspective(migration);
        }
        clickByText(navMenu, "Dependencies");
        cy.wait(2 * SEC);
        selectItemsPerPage(itemsPerPage);
    }

    public static validateFilter(
        dependencies: AppDependency[],
        filterType: filterDependency,
        filterValue: string
    ): void {
        dependencies.forEach((dependency) => {
            const isApplicableFilter =
                filterType === filterDependency.tags ||
                filterType === filterDependency.language ||
                filterType === filterDependency.deppName;

            if (isApplicableFilter) {
                filterValue = dependency[filterValue];
            }

            Dependencies.openList();
            selectFilter(filterType);
            inputText(searchInput, filterValue);
            click(searchButton);
            cy.get("tr").should("not.contain", "No data available");
        });
    }
}
