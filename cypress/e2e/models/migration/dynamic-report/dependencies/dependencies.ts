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
import { dependencyFilter, migration, SEC } from "../../../../types/constants";
import { navMenu } from "../../../../views/menu.view";
import { AppDependency } from "../../../../types/types";
import {
    archetypeFilterName,
    bsFilterName,
    searchInput,
    tagFilterName,
} from "../../../../views/issue.view";
import { searchButton, span } from "../../../../views/common.view";
import { dependencyColumns } from "../../../../views/dependency.view";

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

    public static applyFilter(filterType: dependencyFilter, filterValue: string): void {
        let selector = "";
        Dependencies.openList();
        selectFilter(filterType);
        const isApplicableFilter =
            filterType === dependencyFilter.appName ||
            filterType === dependencyFilter.deppName ||
            filterType === dependencyFilter.language;

        if (isApplicableFilter) {
            inputText(searchInput, filterValue);
            click(searchButton);
        } else {
            if (filterType == dependencyFilter.bs) {
                selector = bsFilterName;
            } else if (filterType == dependencyFilter.tags) {
                selector = tagFilterName;
            } else if (filterType == dependencyFilter.archetype) {
                selector = archetypeFilterName;
            }
            click(selector);
            clickByText(span, filterValue);
            click(selector);
            cy.wait(SEC);
        }
    }

    public static validateFilter(dependency: AppDependency): void {
        cy.get("tr").should("not.contain", "No data available");
        validateTextPresence(dependencyColumns.name, dependency.name);
        validateTextPresence(dependencyColumns.language, dependency.language);
        dependency.labels.forEach((label) => {
            validateTextPresence(dependencyColumns.labels, label);
        });
    }
}
