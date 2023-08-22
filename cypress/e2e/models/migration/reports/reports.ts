/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

import { selectItemsPerPage } from "../../../../utils/utils";
import { applicationName, risk } from "../../../types/constants";
import {
    articleCard,
    articleExpandedContent,
    articleHeader,
    articleItem,
    button,
} from "../../../views/reports.view";

//TODO Update following method to a possible usage of current "selectItemsPerPage" method or reuse it inside following method
export function selectItemsPerPageinReports(items: number, articleTitle: string): void {
    cy.log(`Select ${items} per page`);
    cy.get(articleTitle)
        .closest(articleItem)
        .within(() => {
            selectItemsPerPage(items);
        });
}

export function expandArticle(name: string): void {
    cy.xpath(`//h3[contains(text(), '${name}')]`)
        .closest(articleItem)
        .within(() => {
            cy.get(articleCard).then(($div) => {
                if ($div.find(articleExpandedContent).length === 0) {
                    cy.get(button).eq(0).click({ force: true });
                }
            });
        });
}

export function verifyApplicationRisk(risktype: string, appName: string): void {
    // Verifies particular application's risk type
    selectItemsPerPageAdoptionCandidate(100);
    cy.wait(4000);
    cy.get(".pf-c-table > tbody > tr")
        .not(".pf-c-table__expandable-row")
        .each(($ele) => {
            if ($ele.find(`td[data-label="${applicationName}"]`).text() == appName) {
                expect($ele.find(`td[data-label="${risk}"]`).text().toLowerCase()).to.equal(
                    risktype
                );
            }
        });
}
export function closeArticle(articleTitle: string): void {
    cy.get(articleTitle)
        .closest(articleCard)
        .find(articleHeader)
        .within(() => {
            cy.get("button").click();
        });
}
