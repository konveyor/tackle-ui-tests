import {
    click,
    clickByText,
    getUrl,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    validateTextPresence,
} from "../../../../../utils/utils";
import { filterDependency, migration, SEC } from "../../../../types/constants";
import { navMenu } from "../../../../views/menu.view";
import { AppDependency } from "../../../../types/types";
import { bsFilterName, searchInput, tagFilterName } from "../../../../views/issue.view";
import { searchButton, span } from "../../../../views/common.view";
import { depemdencyColumns } from "../../../../views/dependency.view";

export class Dependencies {
    /** Contains URL of dependencies web page */
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
            let selector = "";
            const isDataMember =
                filterType === filterDependency.tags ||
                filterType === filterDependency.language ||
                filterType === filterDependency.deppName;

            if (isDataMember) {
                filterValue = dependency[filterValue];
            }

            cy.log(`<<<<---- Filter value = ${filterValue}`);
            cy.pause();

            const isApplicableFilter =
                filterType === filterDependency.appName ||
                filterType === filterDependency.deppName ||
                filterType === filterDependency.language;

            Dependencies.openList();
            selectFilter(filterType);

            if (isApplicableFilter) {
                inputText(searchInput, filterValue);
                click(searchButton);
            } else {
                if (filterType == filterDependency.bs) {
                    selector = bsFilterName;
                } else if (filterType == filterDependency.tags) {
                    selector = tagFilterName;
                }
                click(selector);
                if (Array.isArray(filterValue)) {
                    filterValue.forEach((name) => {
                        clickByText(span, name);
                    });
                } else {
                    clickByText(span, filterValue);
                }
                click(selector);
            }
            cy.get("tr").should("not.contain", "No data available");
            validateTextPresence(depemdencyColumns.name, dependency["name"]);
        });
    }
}
