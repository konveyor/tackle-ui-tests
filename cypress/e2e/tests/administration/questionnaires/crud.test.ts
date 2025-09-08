import {
    checkErrorMessage,
    checkSuccessAlert,
    cleanupDownloads,
    login,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { alertTitle, errorAlertMessage, successAlertMessage } from "../../../views/common.view";

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

    it("Import questionnaire & delete it", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${importedQuestionnaire} was successfully created.`,
            true
        );
        AssessmentQuestionnaire.enable(importedQuestionnaire, false);
        deleteQuestionnaire(importedQuestionnaire);
    });

    it("Duplicate questionnaire Test", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(
            successAlertMessage,
            `Questionnaire ${importedQuestionnaire} was successfully created.`,
            true
        );
        AssessmentQuestionnaire.import(yamlFileName, false);
        checkErrorMessage(
            errorAlertMessage,
            "A questionnaire with this name already exists. Use a different name.",
            true
        );
        deleteQuestionnaire(importedQuestionnaire);
    });

    it("Export questionnaire and Import it back", function () {
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
        AssessmentQuestionnaire.import("questionnaire_import/questionnaire-1.yaml", false);
        checkErrorMessage(
            errorAlertMessage,
            "A questionnaire with this name already exists. Use a different name.",
            true
        );
    });

    function deleteQuestionnaire(questionnaireName: string) {
        AssessmentQuestionnaire.delete(questionnaireName);
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${questionnaireName} was successfully deleted.`,
            true
        );
    }

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
