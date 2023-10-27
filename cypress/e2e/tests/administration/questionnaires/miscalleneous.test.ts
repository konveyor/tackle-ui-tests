import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { click, login } from "../../../../utils/utils";
import { downloadYamlTemplate } from "../../../views/assessmentquestionnaire.view";

const yamlFileName = "questionnaire_import/cloud-native.yaml";
const fileName = "Cloud Native";

describe(["@tier2"], "Questionnaire CRUD operations", () => {
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
});
