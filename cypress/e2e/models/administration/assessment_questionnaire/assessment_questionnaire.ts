import { click, clickByText, selectUserPerspective, inputText, performRowActionByIcon } from "../../../../utils/utils";
import { SEC, assessmentQuestionnaires, deleteAction } from "../../../types/constants";
import { legacyPathfinderToggle } from "../../../views/assessmentquestionnaire.view";
import { navMenu } from "../../../views/menu.view";
import { button } from "../../../../e2e/types/constants";
import { actionButton } from "../../../views/applicationinventory.view";

"input#required-switch-0";

// const fileName = "questionnaire_import/cloud-native.yaml"
export interface AssessmentQuestionnaire {
    fileName: string;
}

export class AssessmentQuestionnaire {
    public static fullUrl = Cypress.env("tackleUrl") + "/assessment";

    /*
    constructor(
        fileName: string,
    ) {
        this.fileName = fileName;
    }*/

    public static open() {
        cy.url().then(($url) => {
            if ($url != AssessmentQuestionnaire.fullUrl) {
                selectUserPerspective("Administration");
                clickByText(navMenu, assessmentQuestionnaires);
            }
        });
    }

    public static importQuestionnaire(fileName) {
        AssessmentQuestionnaire.open();
        clickByText(button, "Import questionnaire");
        cy.get('input#yamlFile-file-upload-filename', { timeout: 2 * SEC }).attachFile(fileName, {
            subjectType: "drag-n-drop",
        });
        cy.get("form.pf-v5-c-form", { timeout: 5 * SEC })
        .find("button")
        .contains("Import")
        .click();
    }

    public static deleteQuestionnaire(fileName) {
        AssessmentQuestionnaire.open();
        cy.contains(fileName, { timeout: 120 * SEC })
        .closest('tr')
        .within(() => {
            click(actionButton);
        })
        clickByText(button, deleteAction);
        inputText(".confirm-deletion-input", fileName);
        clickByText(button, deleteAction);
    }

    public static exportQuestionnaire(fileName) {
        AssessmentQuestionnaire.open();
        cy.contains(fileName, { timeout: 120 * SEC })
        .closest('tr')
        .within(() => {
            click(actionButton);
        })
        clickByText(button, 'Export');
    }

    public static toggleQuestionnaire(fileName, toggle: boolean) {
        AssessmentQuestionnaire.open();
        let selector  = (toggle)? ".pf-m-on" : ".pf-m-off";
        cy.contains(fileName, { timeout: 120 * SEC })
            .closest("tr")
            .within(() => {
                cy.get(selector)
                    .invoke("css", "display")
                    .then((display) => {
                        if (display.toString() == "none") {
                            click(".pf-v5-c-switch__toggle");
                        }
                    });
            });
    }

    public downloadYamlTemplate() {
        AssessmentQuestionnaire.open();
    }

    /*
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
    }*/
}
