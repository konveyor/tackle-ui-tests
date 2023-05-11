import { SEC } from "../../../types/constants";
import { clickByText } from "../../../../utils/utils";
import {
    dropdownMenu,
    selectFilter,
    inputTextField,
    selectSortBy,
} from "../../../views/reportPage.view";

export class Report {
    applyFilter(filterName: string, searchText: string): void {
        // Select the filter by filterName
        cy.get(selectFilter).within(() => {
            cy.get("div.input-group-btn").eq(0).click();
            cy.get(dropdownMenu).within(() => {
                clickByText("a", filterName);
            });
        });
        // Enter the search text and Enter
        cy.get(inputTextField).eq(0).clear().type(searchText).type("{enter}");
        cy.wait(2 * SEC);
    }

    applySortAction(sortbyName: string) {
        // Select the sort-by options
        cy.get(selectSortBy).click();
        cy.get(dropdownMenu).within(() => {
            clickByText("a", sortbyName);
        });
    }

    matchAppsOrder(): void {
        cy.get("div[class='fileName'] > a").then(($elements) => {
            const apps = Array.from($elements, (element) => element.innerText);
            expect(apps).to.deep.eq(apps.sort());
        });
    }

    matchStoryPointsOrder(): void {
        cy.get("span[class='points']").then(($elements) => {
            const points = Array.from($elements, (element) => element.innerText);
            expect(points).to.deep.eq(points.sort());
        });
    }
}
