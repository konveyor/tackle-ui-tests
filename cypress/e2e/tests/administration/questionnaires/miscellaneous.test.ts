import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { cleanupDownloads, click, login } from "../../../../utils/utils";
import { downloadYamlTemplate } from "../../../views/assessmentquestionnaire.view";

describe(["@tier3"], "Miscellaneous Questinnaire tests", () => {
    before("Login", function () {
        login();
    });

    it("Download YAML template", function () {
        AssessmentQuestionnaire.open();
        click(downloadYamlTemplate);
        cy.readFile("cypress/downloads/questionnaire-template.yaml").should(
            "contain",
            "Test questionnaire  (SAMPLE)"
        );
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
