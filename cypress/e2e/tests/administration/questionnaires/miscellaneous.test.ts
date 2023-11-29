import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { cleanupDownloads, click, login } from "../../../../utils/utils";
import { downloadYamlTemplate } from "../../../views/assessmentquestionnaire.view";
const filePath = "cypress/downloads/questionnaire-template.yaml";
const yaml = require("js-yaml");

describe(["@tier3"], "Miscellaneous Questinnaire tests", () => {
    before("Login", function () {
        login();
    });

    it("Download YAML template", function () {
        // Polarion TC MTA-397
        AssessmentQuestionnaire.open();
        click(downloadYamlTemplate);
        cy.readFile(filePath).then((fileContent) => {
            try {
                yaml.load(fileContent);
                // Parsing successful, file is in YAML format
            } catch (error) {
                // Parsing failed, file is not in YAML format
                throw new Error(`File is not in YAML format: ${filePath}`);
            }
        });
        cy.readFile(filePath).should("contain", "Test questionnaire  (SAMPLE)");
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
