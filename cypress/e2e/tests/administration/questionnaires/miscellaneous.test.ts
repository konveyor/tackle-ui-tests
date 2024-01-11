import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { cleanupDownloads, click, login, notExists } from "../../../../utils/utils";
import { downloadYamlTemplate } from "../../../views/assessmentquestionnaire.view";
import { sampleQuestionnaireTemplate } from "../../../types/constants";
const filePath = "cypress/downloads/questionnaire-template.yaml";
const yaml = require("js-yaml");
const yamlFile = "questionnaire_import/questionnaire-template-sample.yaml";

describe(["@tier3"], "Miscellaneous Questinnaire tests", () => {
    before("Login", function () {
        login();
    });

    it("Download YAML template", function () {
        // Polarion TC MTA-397
        AssessmentQuestionnaire.open();
        click(downloadYamlTemplate);
        cy.wait(6000);
        cy.readFile(filePath).then((fileContent) => {
            try {
                yaml.load(fileContent);
                // Parsing successful, file is in YAML format
            } catch (error) {
                // Parsing failed, file is not in YAML format
                throw new Error(`File is not in YAML format: ${filePath}`);
            }
        });
        cy.readFile(filePath).should(
            "contain",
            "Uploadable Cloud Readiness Questionnaire Template"
        );
    });

    it("Delete imported sample questionnaire", function () {
        // Automates bugs: https://issues.redhat.com/browse/MTA-1725 and https://issues.redhat.com/browse/MTA-1781

        AssessmentQuestionnaire.open();

        AssessmentQuestionnaire.import(yamlFile);

        AssessmentQuestionnaire.delete(sampleQuestionnaireTemplate);

        notExists(sampleQuestionnaireTemplate);
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
