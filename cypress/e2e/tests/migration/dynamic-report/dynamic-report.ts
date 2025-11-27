import {
    click,
    clickByText,
    getUrl,
    inputText,
    performWithin,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    waitUntilSpinnerIsGone,
} from "../../../../utils/utils";
import { button, issueFilter, migration, SEC, singleApplication } from "../../../types/constants";
import { searchButton, searchInput, span } from "../../../views/common.view";
import { searchMenuToggle, singleAppDropList } from "../../../views/issue.view";
import { navMenu } from "../../../views/menu.view";

export abstract class DynamicReports {
    static urlSuffix: string;
    static menuName: string;

    static get fullUrl(): string {
        return Cypress.config("baseUrl") + (this as any).urlSuffix;
    }

    public static openList(itemsPerPage = 100, forceReload = false): void {
        const clazz = this as typeof DynamicReports;

        if (forceReload) cy.visit(clazz.fullUrl);
        if (!getUrl().includes(clazz.fullUrl)) selectUserPerspective(migration);

        clickByText(navMenu, clazz.menuName);
        cy.wait(2 * SEC);
        waitUntilSpinnerIsGone();
        selectItemsPerPage(itemsPerPage);
    }

    public static openSingleApplication(applicationName: string): void {
        // this === Inheritor (Issues, Insights и т.д.)
        this.openList();

        clickByText(button, singleApplication);
        click(singleAppDropList);
        clickByText(button, applicationName);
    }

    public static unfold(name: string): void {
        performWithin(name, () => {
            cy.get("[id^=expandable]").then(($button) => {
                if (!$button.hasClass("pf-m-expanded")) {
                    $button.trigger("click");
                }
            });
        });
    }

    public static applyFilter(
        filterType: issueFilter,
        filterValue: string,
        isSingle = false
    ): void {
        if (!isSingle) {
            this.openList();
        }

        selectFilter(filterType);
        const isApplicableFilter =
            filterType === issueFilter.category ||
            filterType === issueFilter.source ||
            filterType === issueFilter.target;

        if (isApplicableFilter) {
            inputText(searchInput, filterValue);
            click(searchButton);
        } else {
            click(searchMenuToggle);
            clickByText(span, filterValue);
            click(searchMenuToggle);
        }
    }

    public static applyMultiFilter(filterType: issueFilter, filterValues: string[]): void {
        this.openList();
        selectFilter(filterType);
        click(searchMenuToggle);
        filterValues.forEach((filterValue) => clickByText(span, filterValue));
        click(searchMenuToggle);
    }
}
