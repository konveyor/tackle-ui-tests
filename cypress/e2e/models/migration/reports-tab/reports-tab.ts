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
import { SEC, migration } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import {
    highRiskDonut,
    lowRiskDonut,
    mediumRiskDonut,
    unknownRiskDonut,
} from "../../../views/reportsTab.view";

export class Reports {
    static fullUrl = Cypress.env("tackleUrl") + "/reports";

    public static open(itemsPerPage?: number): void {
        if (!getUrl().includes(Reports.fullUrl)) {
            selectUserPerspective(migration);
        }
        clickByText(navMenu, "Reports");
        cy.wait(2 * SEC);
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
        Reports.open();
        this.getRiskValue(highRiskDonut, highRiskValue);
        this.getTotalApplicationsValue(highRiskDonut, totalApps);
        this.getRiskValue(mediumRiskDonut, mediumRiskValue);
        this.getTotalApplicationsValue(mediumRiskDonut, totalApps);
        this.getRiskValue(lowRiskDonut, lowRiskValue);
        this.getTotalApplicationsValue(lowRiskDonut, totalApps);
        this.getRiskValue(unknownRiskDonut, unknownRiskValue);
        this.getTotalApplicationsValue(unknownRiskDonut, totalApps);
    }

    public static getRiskValue(selector, value): void {
        cy.get(selector)
            .eq(0)
            .find("tspan")
            .eq(0)
            .invoke("text")
            .then(($text) => {
                cy.wrap(parseFloat($text)).should("eq", value);
            });
    }

    public static getTotalApplicationsValue(selector, value): void {
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
