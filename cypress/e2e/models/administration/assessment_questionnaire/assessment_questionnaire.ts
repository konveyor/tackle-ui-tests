import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { SEC, assessmentQuestionnaires } from "../../../types/constants";
import { legacyPathfinderToggle } from "../../../views/assessmentquestionnaire.view";
import { navMenu } from "../../../views/menu.view";

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

    public importQuestionnaire() {
        AssessmentQuestionnaire.open();
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
