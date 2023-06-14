import { SEC } from "../../../types/constants";

export class Metrics {
    metricsUrl: string;

    constructor() {
        let splitted = Cypress.env("tackleUrl").split("//");
        this.metricsUrl = "http://metrics-" + splitted[1] + "metrics";
    }

    validateApplicationsInventoried(value: number): void {
        cy.wait(30 * SEC);
        cy.request(this.metricsUrl)
            .its("body")
            .should("contain", `konveyor_applications_inventoried ${value}`);
    }
}
