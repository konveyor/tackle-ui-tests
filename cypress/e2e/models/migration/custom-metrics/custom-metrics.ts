import { SEC } from "../../../types/constants";

export class Metrics {
    metricsUrl: string;

    constructor() {
        let splitted = Cypress.env("tackleUrl").split("//");
        this.metricsUrl = "http://metrics-" + splitted[1] + "/metrics";
    }

    validateMetric(metricName: string, value: number): void {
        cy.wait(30 * SEC);
        cy.request(this.metricsUrl).its("body").should("contain", `${metricName} ${value}`);
    }

    getValue(metricName: string): Cypress.Chainable<number> {
        cy.wait(30 * SEC);
        return cy
            .request(this.metricsUrl)
            .its("body")
            .then((body) => {
                // Split the content into lines
                let allLines = body.split("\n");
                // Find the analyes counter line
                let foundLine = allLines.find((line: string) => line.startsWith(metricName));
                let currentCounterValue = foundLine.split(" ").pop();
                return Number(currentCounterValue);
            });
    }
}
