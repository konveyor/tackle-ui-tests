import {
    click,
    clickByText,
    getUrl,
    performWithin,
    selectItemsPerPage,
    selectUserPerspective,
    waitUntilSpinnerIsGone,
} from "../../../../utils/utils";
import { button, migration, SEC, singleApplication } from "../../../types/constants";
import { singleAppDropList } from "../../../views/issue.view";
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
}
