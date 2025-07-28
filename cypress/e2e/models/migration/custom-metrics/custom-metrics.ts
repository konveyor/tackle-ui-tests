import { SEC } from "../../../types/constants";

export class Metrics {
    metricsUrl: string;

    constructor() {
        this.metricsUrl = Cypress.env("metricsUrl");
    }

    validateMetric(metricName: string, value: number): void {
        cy.wait(30 * SEC);
        cy.request(this.metricsUrl).its("body").should("contain", `${metricName} ${value}`);
    }

    validateMetricsDisabled(): void {
        cy.wait(30 * SEC);
        cy.request({
            url: this.metricsUrl,
            failOnStatusCode: false, // Prevent Cypress from failing the test on non-2xx responses
        }).then((response) => {
            expect(response.status).to.eq(503); // Ensure the response status is 503
        });
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
