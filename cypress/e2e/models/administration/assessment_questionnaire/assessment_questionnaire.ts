import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { SEC, assessmentQuestionnaires, deleteAction } from "../../../types/constants";
import {
    legacyPathfinderToggle,
    questionnaireUpload,
    confirmDeletion,
    importQuestionnaire,
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

    public static operation(fileName, operation) {
        AssessmentQuestionnaire.open();
        cy.contains(fileName, { timeout: 120 * SEC })
            .closest("tr")
            .within(() => {
                click(actionButton);
            });
        clickByText(button, operation);
    }

    public static importQuestionnaire(fileName) {
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

    public static deleteQuestionnaire(fileName) {
        AssessmentQuestionnaire.operation(fileName, deleteAction);
        cy.get(confirmDeletion).click().focused().clear().type(fileName);
        clickByText(button, deleteAction);
    }

    public static exportQuestionnaire(fileName) {
        AssessmentQuestionnaire.operation(fileName, "Export");
    }

    public static viewQuestionnaire(fileName) {
        AssessmentQuestionnaire.operation(fileName, "View");
    }

    public downloadYamlTemplate() {
        AssessmentQuestionnaire.open();
    }

    public static enableLegacyQuestionanire() {
        AssessmentQuestionnaire.open();
        cy.get(legacyPathfinderToggle, { timeout: 2 * SEC }).then(($checkbox) => {
            if (!$checkbox.prop("checked")) {
                click(legacyPathfinderToggle);
            }
        });
    }

    public static disableLegacyQuestionanire() {
        AssessmentQuestionnaire.open();
        cy.get(legacyPathfinderToggle, { timeout: 2 * SEC }).then(($checkbox) => {
            if ($checkbox.prop("checked")) {
                click(legacyPathfinderToggle);
            }
        });
    }
}
