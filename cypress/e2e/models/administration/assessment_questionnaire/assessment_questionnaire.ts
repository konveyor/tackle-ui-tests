import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { SEC, assessmentQuestionnaires } from "../../../types/constants";
import { legacyPathfinderToggle } from "../../../views/assessmentquestionnaire.view";
import { navMenu } from "../../../views/menu.view";
import { button } from "../../../../e2e/types/constants";

export interface AssessmentQuestionnaire {
    fileName: string;
}

export class AssessmentQuestionnaire {
    public static fullUrl = Cypress.env("tackleUrl") + "/assessment";

    constructor(
        fileName: string,
    ) {
        this.fileName = fileName;
    }

    public static open() {
        cy.url().then(($url) => {
            if ($url != AssessmentQuestionnaire.fullUrl) {
                selectUserPerspective("Administration");
                clickByText(navMenu, assessmentQuestionnaires);
            }
        });
    }

    public importQuestionnaire() {
        AssessmentQuestionnaire.open();
        clickByText(button, "Import questionnaire");
        cy.get('input[type="file"]', { timeout: 2 * SEC }).attachFile(fileName, {
            subjectType: "drag-n-drop",
        });
        cy.get("form.pf-v5-c-form", { timeout: 5 * SEC })
        .find("button")
        .contains("Import")
        .trigger("click");
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
