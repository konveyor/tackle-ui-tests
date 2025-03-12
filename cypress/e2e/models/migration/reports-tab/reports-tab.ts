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

import {
    clickByText,
    getUrl,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import { migration, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import {
    highRiskDonut,
    lowRiskDonut,
    mediumRiskDonut,
    unknownRiskDonut,
} from "../../../views/reportsTab.view";

export class Reports {
    static fullUrl = Cypress.config("baseUrl") + "/reports";

    public static open(itemsPerPage?: number): void {
        if (!getUrl().includes(Reports.fullUrl)) {
            selectUserPerspective(migration);
        }
        clickByText(navMenu, "Reports");
        cy.get("h1", { timeout: 60 * SEC }).should("contain", "Reports");
        if (itemsPerPage) {
            selectItemsPerPage(itemsPerPage);
        }
    }

    public static verifyRisk(
        highRiskValue: number,
        mediumRiskValue: number,
        lowRiskValue: number,
        unknownRiskValue: number,
        totalApps: string
    ): void {
        this.verifyRiskValue(highRiskDonut, highRiskValue);
        this.getTotalApplicationsValue(highRiskDonut, totalApps);
        this.verifyRiskValue(mediumRiskDonut, mediumRiskValue);
        this.getTotalApplicationsValue(mediumRiskDonut, totalApps);
        this.verifyRiskValue(lowRiskDonut, lowRiskValue);
        this.getTotalApplicationsValue(lowRiskDonut, totalApps);
        this.verifyRiskValue(unknownRiskDonut, unknownRiskValue);
        this.getTotalApplicationsValue(unknownRiskDonut, totalApps);
    }

    public static verifyRiskValue(selector: string, value: number): void {
        cy.get(selector)
            .eq(0)
            .find("tspan")
            .eq(0)
            .invoke("text")
            .then(($text) => {
                cy.wrap(parseFloat($text)).should("eq", value);
            });
    }

    public static getRiskValue(riskDonutSelector: string): Cypress.Chainable<string> {
        Reports.open();
        return cy.get(riskDonutSelector).eq(0).find("tspan").eq(0).invoke("text");
    }

    public static getTotalApplicationsValue(selector: string, value: string): void {
        cy.get(selector)
            .eq(0)
            .find("tspan")
            .eq(1)
            .invoke("text")
            .then(($text) => {
                cy.wrap($text).should("include", value);
            });
    }
}
