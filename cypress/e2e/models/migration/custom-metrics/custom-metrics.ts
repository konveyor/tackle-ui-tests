import { SEC } from "../../../types/constants";

export class Metrics {
    metricsUrl: string;

    constructor() {
        let splitted = Cypress.env("tackleUrl").split("//");
        this.metricsUrl = "http://metrics-" + splitted[1] + "/metrics";
    }

    validateApplicationsInventoried(value: number): void {
        cy.wait(30 * SEC);
        cy.request(this.metricsUrl)
            .its("body")
            .should("contain", `konveyor_applications_inventoried ${value}`);
    }

    validateAssessmentsInitiated(value: number): void {
        cy.wait(30 * SEC);
        cy.request(this.metricsUrl)
            .its("body")
            .should("contain", `konveyor_assessments_initiated_total ${value}`);
    }

    validateTasksInitiated(value: number): void {
        cy.wait(30 * SEC);
        cy.request(this.metricsUrl)
            .its("body")
            .should("contain", `konveyor_tasks_initiated_total ${value}`);
    }

    getTasksInitiatedCounter(): Cypress.Chainable<number> {
        cy.wait(30 * SEC);
        return cy
            .request(this.metricsUrl)
            .its("body")
            .then((body) => {
                // Split the content into lines
                let allLines = body.split("\n");
                // Find the analyes counter line
                let foundLine = allLines.find((line: string) =>
                    line.startsWith("konveyor_tasks_initiated_total")
                );
                let currentCounterValue = foundLine.split(" ").pop();
                return Number(currentCounterValue);
            });
    }
}
