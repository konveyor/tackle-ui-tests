import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import {
    cleanupDownloads,
    checkSuccessAlert,
    login,
    closeModalWindow,
    click,
} from "../../../../utils/utils";
import { alertTitle } from "../../../views/common.view";

const yamlFileName = "questionnaire_import/cloud-native.yaml";
const fileName = "Cloud Native";
const legacyQuestionnaire = "Legacy Pathfinder"

describe(["@tier2"], "Questionnaire CRUD operations", () => {
    before("Login", function () {
        login();
    });

    it("Import questionnaire", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${fileName} was successfully created.`,
            true
        );
        AssessmentQuestionnaire.enable(fileName, false);
    });

    it("Duplicate questionnaire Test", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(alertTitle, "UNIQUE constraint failed: Questionnaire.Name");
        closeModalWindow();
    });

    it("Export questionnaire", function () {
        AssessmentQuestionnaire.export(legacyQuestionnaire);
        cy.readFile("cypress/downloads/questionnaire-1.yaml").should("contain", fileName);
    });

    it("Delete questionnaire", function () {
        AssessmentQuestionnaire.delete(fileName);
        checkSuccessAlert(
            alertTitle,
            `Success alert:Questionnaire ${fileName} was successfully deleted.`,
            true
        );
    });

    after("Cleaning up", function () {
        cleanupDownloads();
    });
});
