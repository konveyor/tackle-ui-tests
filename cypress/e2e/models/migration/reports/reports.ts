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
import { applicationName, button, risk } from "../../../types/constants";
import {
    applicationConfidenceandRiskTitle,
    articleButton,
    articleCard,
    articleExpandedContent,
    articleHeader,
    articleItem,
} from "../../../views/reports.view";

export function selectItemsPerPageInReports(items: number, articleTitle: string): void {
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
                if (!$div.find(articleExpandedContent).length) {
                    cy.get(articleButton).eq(0).click({ force: true });
                }
            });
        });
}

export function verifyApplicationRisk(riskType: string, appName: string): void {
    // Verifies particular application's risk type
    selectItemsPerPageInReports(100, applicationConfidenceandRiskTitle);
    cy.wait(4000);
    cy.get(applicationConfidenceandRiskTitle)
        .closest(articleItem)
        .find("tbody > tr")
        .each(($ele) => {
            if ($ele.find(`td[data-label="${applicationName}"]`).text() == appName) {
                expect($ele.find(`td[data-label="${risk}"]`).text().toLowerCase()).to.equal(
                    riskType
                );
            }
        });
}
export function closeArticle(articleTitle: string): void {
    cy.get(articleTitle)
        .closest(articleCard)
        .find(articleHeader)
        .within(() => {
            cy.get(button).click();
        });
}
