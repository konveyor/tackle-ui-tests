/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

import * as commonView from "../../views/common.view";
import { itemsPerPageMenu, itemsPerPageToggleButton } from "../../views/reports.view";

export function selectItemsPerPageAdoptionCandidate(items: number): void {
    cy.get(itemsPerPageMenu)
        .find(itemsPerPageToggleButton)
        .then(($toggleBtn) => {
            if (!$toggleBtn.eq(0).is(":disabled")) {
                $toggleBtn.eq(0).trigger("click");
                cy.get(commonView.itemsPerPageMenuOptions);
                cy.get(`li > button[data-action="per-page-${items}"]`).click();
                cy.wait(2000);
            }
        });
    cy.wait(2000);
}

export function selectItemsPerPageIdentifiedRisks(items: number): void {
    cy.get(itemsPerPageMenu)
        .find(itemsPerPageToggleButton)
        .then(($toggleBtn) => {
            if (!$toggleBtn.eq(1).is(":disabled")) {
                $toggleBtn.eq(1).trigger("click");
                cy.wait(1000);
                cy.get(commonView.itemsPerPageMenuOptions);
                cy.get(`li > button[data-action="per-page-${items}"]`).click();
                cy.wait(2000);
            }
        });
}

export function expandArticle(name: string): void {
    cy.xpath(
        `//h3[contains(text(), '${name}')]//ancestor::article//div[@class='pf-c-card__header-toggle']//button/span`
    ).click({ force: true });
    cy.wait(2000);
}
