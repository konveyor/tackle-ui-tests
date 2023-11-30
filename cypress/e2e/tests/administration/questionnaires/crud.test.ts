import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import {
    cleanupDownloads,
    checkSuccessAlert,
    login,
    closeModalWindow,
} from "../../../../utils/utils";
import { alertTitle } from "../../../views/common.view";

const yamlFileName = "questionnaire_import/cloud-native.yaml";
const importedQuestionnaire = "Cloud Native";
const legacyQuestionnaire = "Legacy Pathfinder";

describe(["@tier2"], "1 Bug: Questionnaire CRUD operations", () => {
    before("Login", function () {
        login();
        // This test will fail if there are preexisting questionnaire.
        AssessmentQuestionnaire.deleteAllQuesionnaire();
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

    it("Duplicate questionnaire Test", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(alertTitle, "UNIQUE constraint failed: Questionnaire.Name");
        closeModalWindow();
    });

    it("Bug MTA 1721: Export questionnaire and Import it back", function () {
        AssessmentQuestionnaire.export(legacyQuestionnaire);
        cy.readFile("cypress/downloads/questionnaire-1.yaml").should(
            "contain",
            legacyQuestionnaire
        );
        // Polarion TC MTA-423
        AssessmentQuestionnaire.import("cypress/downloads/questionnaire-1.yaml");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire "Legacy Pathfinder" was successfully created.`,
            true
        );
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
