import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { cleanupDownloads, click, login, notExists } from "../../../../utils/utils";
import { downloadYamlTemplate } from "../../../views/assessmentquestionnaire.view";
import { legacyPathfinder, sampleQuestionnaireTemplate } from "../../../types/constants";
import { alertTitle } from "../../../views/common.view";
import { closeModal } from "../../../views/assessment.view";
const filePath = "cypress/downloads/questionnaire-template.yaml";
const yaml = require("js-yaml");
const yamlFile = "questionnaire_import/questionnaire-template-sample.yaml";
const invalidYamlFile = "questionnaire_import/invalid-questionnaire-template.yaml";

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

    it("Import invalid questionnaire", function () {
        // Automates bug https://issues.redhat.com/browse/MTA-1349

        AssessmentQuestionnaire.open();

        AssessmentQuestionnaire.import(invalidYamlFile);

        cy.get(alertTitle).then(($element) => {
            const text = $element.text();
            expect(text).to.contain(
                "Error:Field validation",
                `Error: expected the alert popup to contain text [Error:Field validation] but it didn't.\nInstead found: ${text}`
            );
        });

        click(closeModal);
    });

    it("Performs question search on questionnaires", function () {
        // Automates Polarion - MTA 435
        AssessmentQuestionnaire.open();
        AssessmentQuestionnaire.view(legacyPathfinder);
        const textInput = "Production";
        AssessmentQuestionnaire.searchQuestions(textInput);
        AssessmentQuestionnaire.validateNumberOfMatches("Application details", 4);
        AssessmentQuestionnaire.validateNumberOfMatches("Application cross-cutting concerns", 1);
        AssessmentQuestionnaire.validateSearchWordInRows(textInput);
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
