import {
    click,
    clickByText,
    getUniqueElementsFromSecondArray,
    getUrl,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    validateTextPresence,
} from "../../../../../utils/utils";
import { dependencyFilter, migration, SEC } from "../../../../types/constants";
import { AppDependency } from "../../../../types/types";
import { searchButton, span } from "../../../../views/common.view";
import { dependencyColumns } from "../../../../views/dependency.view";
import { archetypeFilterName, searchInput } from "../../../../views/issue.view";
import { navMenu } from "../../../../views/menu.view";

export class Dependencies {
    /** Contains URL of dependencies web page */
    static fullUrl = Cypress.config("baseUrl") + "/dependencies";

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
            filterType === dependencyFilter.deppName || filterType === dependencyFilter.language;

        if (isApplicableFilter) {
            inputText(searchInput, filterValue);
            click(searchButton);
        } else {
            selector = archetypeFilterName;
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

    public static applyAndValidateFilter(
        filterType: dependencyFilter,
        filterValues: string[],
        dependenciesExpected: AppDependency[],
        dependenciesNotExpected?: AppDependency[]
    ) {
        filterValues.forEach((value) => {
            Dependencies.applyFilter(filterType, value);
        });
        dependenciesExpected.forEach((dependency) => {
            Dependencies.validateFilter(dependency);
        });

        if (dependenciesNotExpected && dependenciesNotExpected.length > 0) {
            getUniqueElementsFromSecondArray(dependenciesExpected, dependenciesNotExpected).forEach(
                (dependency: AppDependency) => {
                    validateTextPresence(dependencyColumns.name, dependency.name, false);
                }
            );
        }
    }
}
