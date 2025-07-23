import {
    checkSuccessAlert,
    cleanupDownloads,
    closeModalWindow,
    login,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { alertTitle } from "../../../views/common.view";

const yamlFileName = "questionnaire_import/cloud-native.yaml";
const importedQuestionnaire = "Cloud Native";
const legacyQuestionnaire = "Legacy Pathfinder";

describe(["@tier2"], "Questionnaire CRUD operations", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        // This test will fail if there are preexisting questionnaire.
        AssessmentQuestionnaire.deleteAllQuestionnaires();
    });

    it("Import questionnaire", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${importedQuestionnaire} was successfully created.`,
            true
        );
        AssessmentQuestionnaire.enable(importedQuestionnaire, false);
    });

    it("Bug MTA-2783: Duplicate questionnaire Test", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(alertTitle, "UNIQUE constraint failed: Questionnaire.Name");
        closeModalWindow();
    });

    it("Bug MTA-2783: Export questionnaire and Import it back", function () {
        AssessmentQuestionnaire.export(legacyQuestionnaire);
        cy.readFile("cypress/downloads/questionnaire-1.yaml").should(
            "contain",
            legacyQuestionnaire
        );
        cy.exec(
            "cp cypress/downloads/questionnaire-1.yaml cypress/fixtures/questionnaire_import/questionnaire-1.yaml"
        ).then((result) => {
            cy.log(result.stdout);
        });
        // Polarion TC MTA-423
        AssessmentQuestionnaire.import("questionnaire_import/questionnaire-1.yaml");
        checkSuccessAlert(alertTitle, "UNIQUE constraint failed: Questionnaire.Name");
    });

    it("Delete questionnaire", function () {
        AssessmentQuestionnaire.delete(importedQuestionnaire);
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${importedQuestionnaire} was successfully deleted.`,
            true
        );
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
