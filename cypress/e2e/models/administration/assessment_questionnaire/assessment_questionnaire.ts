import {
    click,
    clickByText,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import { SEC, assessmentQuestionnaires, deleteAction, trTag } from "../../../types/constants";
import {
    questionnaireUpload,
    confirmDeletion,
    importQuestionnaire,
    switchToggle,
} from "../../../views/assessmentquestionnaire.view";
import { navMenu } from "../../../views/menu.view";
import { button } from "../../../../e2e/types/constants";
import { actionButton } from "../../../views/applicationinventory.view";
import * as commonView from "../../../views/common.view";

export class AssessmentQuestionnaire {
    public static fullUrl = Cypress.env("tackleUrl") + "/assessment";

    public static open() {
        cy.url().then(($url) => {
            if ($url != AssessmentQuestionnaire.fullUrl) {
                selectUserPerspective("Administration");
                clickByText(navMenu, assessmentQuestionnaires);
            }
        });
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
        cy.get(questionnaireUpload, { timeout: 2 * SEC }).attachFile(fileName, {
            subjectType: "drag-n-drop",
        });
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
        let selector = enable ? ".pf-m-on" : ".pf-m-off";
        cy.contains(fileName, { timeout: 2 * SEC })
            .closest("tr")
            .within(() => {
                cy.get(selector)
                    .invoke("css", "display")
                    .then((display) => {
                        if (display.toString() == "none") {
                            click(switchToggle);
                        }
                    });
            });
    }

    public static deleteAllQuesionnaire() {
        AssessmentQuestionnaire.open();
        selectItemsPerPage(100);
        cy.get(commonView.commonTable)
            .find(trTag)
            .then(($rows) => {
                for (let i = 0; i < $rows.length - 1; i++) {
                    cy.get(actionButton).eq(0).click({ force: true });
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

    public downloadYamlTemplate() {
        AssessmentQuestionnaire.open();
    }
}
