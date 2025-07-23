import "cypress-fs";
import { checkSuccessAlert, cleanupDownloads, click, notExists } from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import {
    cloudNative,
    legacyPathfinder,
    sampleQuestionnaireTemplate,
} from "../../../types/constants";
import { downloadYamlTemplate } from "../../../views/assessmentquestionnaire.view";
import { alertTitle } from "../../../views/common.view";

import { closeModal } from "../../../views/assessment.view";
const filePath = "cypress/downloads/questionnaire-template.yaml";
const yaml = require("js-yaml");
const yamlFile = "questionnaire_import/questionnaire-template-sample.yaml";
const invalidYamlFile = "questionnaire_import/invalid-questionnaire-template.yaml";
const cloudNativePath = "questionnaire_import/cloud-native.yaml";

const cloudNativeDownloadPath = "cypress/downloads/";

describe(["@tier3"], "Miscellaneous Questionnaire tests", () => {
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

    it("Bug MTA-2782: Import invalid questionnaire", function () {
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
        const invalidTextInput = "invalidTextInput";
        AssessmentQuestionnaire.searchQuestions(invalidTextInput);
        AssessmentQuestionnaire.validateNoMatchesFound();
        AssessmentQuestionnaire.backToQuestionnaire();
    });

    it("Exports and imports existing questionnaire after updating name in file", function () {
        // Automates polarion MTA-437
        const targetNewName = "Cloud Native1";
        const updatedFileName = "cloud-native-updated.yaml";
        const fixturesPath = "cypress/fixtures/" + updatedFileName;

        AssessmentQuestionnaire.import(cloudNativePath);
        AssessmentQuestionnaire.export(cloudNative);

        cy.fsReadDir(cloudNativeDownloadPath).then((filesList) => {
            const matchedFiles = filesList
                .filter((file) => file.startsWith("questionnaire-") && file.endsWith(".yaml"))
                .map((file) => ({
                    file,
                    number: parseInt(file.match(/-(\d+)\.yaml$/)?.[1], 10),
                }))
                .filter((file) => !isNaN(file.number))
                .sort((a, b) => b.number - a.number);

            const latestFileName = matchedFiles.length > 0 ? matchedFiles[0].file : null;
            const filePath = `${cloudNativeDownloadPath}/${latestFileName}`;
            cy.readFile(filePath).then((fileContent) => {
                const updatedContent = AssessmentQuestionnaire.updateYamlContent(
                    fileContent,
                    cloudNative
                );
                cy.writeFile(fixturesPath, updatedContent);
            });
        });

        cy.readFile(fixturesPath).then(() => {
            AssessmentQuestionnaire.import(updatedFileName);
        });
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${targetNewName} was successfully created.`,
            true
        );
        AssessmentQuestionnaire.delete(cloudNative);
        AssessmentQuestionnaire.delete(targetNewName);
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
