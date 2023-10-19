import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { SEC, assessmentQuestionnaires, deleteAction } from "../../../types/constants";
import {
    questionnaireUpload,
    confirmDeletion,
    importQuestionnaire,
    switchToggle,
} from "../../../views/assessmentquestionnaire.view";
import { navMenu } from "../../../views/menu.view";
import { button } from "../../../../e2e/types/constants";
import { actionButton } from "../../../views/applicationinventory.view";
import { controlsForm } from "../../../views/common.view";

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
        cy.get(controlsForm, { timeout: 5 * SEC })
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

    public static enable(fileName: string, enable = true) {
        AssessmentQuestionnaire.open();
        let selector = enable ? ".pf-m-on" : ".pf-m-off";
        cy.contains(fileName, { timeout: 120 * SEC })
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

    public downloadYamlTemplate() {
        AssessmentQuestionnaire.open();
    }
}
