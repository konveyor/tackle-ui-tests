import {
    click,
    clickByText,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import {
    assessmentQuestionnaires,
    button,
    deleteAction,
    legacyPathfinder,
    SEC,
    trTag,
} from "../../../types/constants";
import { actionButton } from "../../../views/applicationinventory.view";
import {
    confirmDeletion,
    importQuestionnaire,
    switchToggle,
} from "../../../views/assessmentquestionnaire.view";
import * as commonView from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";

export class AssessmentQuestionnaire {
    public static fullUrl = Cypress.config("baseUrl") + "/assessment";

    public static open(forceReload = false) {
        const itemsPerPage = 100;
        if (forceReload) {
            cy.visit(AssessmentQuestionnaire.fullUrl, { timeout: 35 * SEC }).then((_) => {
                cy.wait(10 * SEC);
                selectItemsPerPage(itemsPerPage);
            });
            return;
        }
        cy.url().then(($url) => {
            if ($url != AssessmentQuestionnaire.fullUrl) {
                selectUserPerspective("Administration");
                clickByText(navMenu, assessmentQuestionnaires);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    public static operation(fileName: string, operation: string) {
        AssessmentQuestionnaire.open();
        cy.contains(fileName, { timeout: 120 * SEC })
            .closest("tr")
            .within(() => {
                click(actionButton);
            });
        clickByText(button, operation);
    }

    public static import(fileName: string) {
        AssessmentQuestionnaire.open();
        click(importQuestionnaire);
        cy.get('input[type="file"]', { timeout: 2 * SEC }).selectFile(
            `cypress/fixtures/${fileName}`,
            {
                timeout: 120 * SEC,
                force: true,
            }
        );
        cy.get(commonView.controlsForm, { timeout: 5 * SEC })
            .find("button")
            .contains("Import")
            .click();
    }

    public static delete(fileName: string) {
        AssessmentQuestionnaire.operation(fileName, deleteAction);
        cy.get(confirmDeletion).click().focused().clear().type(fileName);
        clickByText(button, deleteAction);
    }

    public static export(fileName: string) {
        AssessmentQuestionnaire.operation(fileName, "Export");
    }

    public static view(fileName: string) {
        AssessmentQuestionnaire.operation(fileName, "View");
    }

    public static disable(fileName: string) {
        this.enable(fileName, false);
    }

    public static enable(fileName: string, enable = true) {
        AssessmentQuestionnaire.open();
        cy.wait(3 * SEC);
        let selector = enable ? ".pf-m-on" : ".pf-m-off";
        cy.contains(fileName, { timeout: 2 * SEC })
            .closest("tr")
            .within(() => {
                cy.get(selector)
                    .invoke("css", "display")
                    .then((display) => {
                        if (display.toString() == "none") {
                            cy.get(switchToggle, { timeout: 2 * SEC }).click();
                        }
                    });
            });
    }

    public static deleteAllQuestionnaires() {
        AssessmentQuestionnaire.open();
        selectItemsPerPage(100);
        cy.get(commonView.commonTable)
            .find('tbody[class="pf-v5-c-table__tbody"]')
            .find(trTag)
            .then(($rows) => {
                if ($rows.length === 1) {
                    return;
                }

                for (let i = 0; i < $rows.length; i++) {
                    const rowName = $rows.eq(i).find('td[data-label="Name"]').text();
                    if (rowName == legacyPathfinder) {
                        continue;
                    }
                    cy.wrap($rows.eq(i).find(actionButton)).click({ force: true });
                    cy.get("li.pf-v5-c-menu__list-item")
                        .contains("Delete")
                        .then(($delete_btn) => {
                            if (!$delete_btn.parent().hasClass("pf-m-aria-disabled")) {
                                const row_name = $delete_btn
                                    .closest("td")
                                    .parent(trTag)
                                    .find('td[data-label="Name"]')
                                    .text();
                                clickByText(button, "Delete", true);
                                cy.get(confirmDeletion).click().focused().clear().type(row_name);
                                clickByText(button, deleteAction);
                            } else {
                                // close menu if nothing to do
                                cy.get(actionButton).eq(0).click({ force: true });
                            }
                        });
                }
            });
    }

    public static searchQuestions(inputText: string): void {
        cy.get(".pf-v5-c-text-input-group__text-input")
            .dblclick() // Double-clicks the input field
            .clear()
            .type(inputText, { force: true })
            .should("have.value", inputText);
    }

    public static updateYamlContent(yamlContent, nameToUpdate) {
        //adds "1" to the name - method can be modified
        let lines = yamlContent.split("\n");
        let updatedLines = lines.map((line) => {
            if (line.trim().startsWith("name: " + nameToUpdate)) {
                return line + "1";
            }
            return line;
        });
        return updatedLines.join("\n");
    }

    static validateNumberOfMatches(section: string, expectedMatches: number): void {
        cy.get(".pf-v5-c-tabs__item-text")
            .contains(section)
            .parent()
            .find("span.pf-v5-c-badge")
            .then(($badge) => {
                const text = $badge.text();
                const match = text.match(/(\d+) match(es)?/);
                const actualMatches = match ? parseInt(match[1]) : 0;
                expect(actualMatches).to.equal(expectedMatches);
            });
    }

    static validateNoMatchesFound(): void {
        cy.get(".pf-v5-c-empty-state__content")
            .find("h2.pf-v5-c-title.pf-m-lg")
            .invoke("text")
            .then((text) => {
                expect(text.trim()).to.match(/^No questions match your search/);
            });
    }

    static backToQuestionnaire(): void {
        cy.get("button.pf-v5-c-button.pf-m-link").contains("Back to questionnaire").click();
        cy.get(".pf-v5-c-content > h1").invoke("text").should("equal", "Assessment questionnaires");
    }

    static validateSearchWordInRows(textInput: string): void {
        const lowerCaseInput = textInput.toLowerCase();

        cy.get(".pf-v5-c-table > tbody > tr:not(.pf-v5-c-table__expandable-row):visible").each(
            ($row) => {
                cy.wrap($row)
                    .find('td[data-label="Name"]')
                    .invoke("text")
                    .then((cellText) => {
                        if (!cellText.toLowerCase().includes(lowerCaseInput)) {
                            cy.wrap($row).find("td:first button").click();

                            cy.wrap($row)
                                .next("tr.pf-v5-c-table__expandable-row")
                                .find(".pf-v5-c-table__expandable-row-content")
                                .invoke("text")
                                .then((expandedText) => {
                                    expect(expandedText.toLowerCase()).to.include(lowerCaseInput);
                                });

                            cy.wrap($row).find("td:first button").click();
                        }
                    });
            }
        );
    }

    public downloadYamlTemplate() {
        AssessmentQuestionnaire.open();
    }
}
