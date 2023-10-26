import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { checkSuccessAlert, login, closeModalWindow } from "../../../../utils/utils";
import { duplicateNameWarning } from "../../../views/common.view";

const yamlFileName = "questionnaire_import/cloud-native.yaml";
const fileName = "Cloud Native";

describe(["@tier2"], "Questionnaire CRUD operations", () => {
    before("Login", function () {
        login();
    });

    it("Import questionnaire", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(
            duplicateNameWarning,
            `Success alert:Questionnaire ${fileName} was successfully created.`,
            true
        );
        AssessmentQuestionnaire.enable(fileName, false);
    });

    it("Duplicate questionnaire Test", function () {
        AssessmentQuestionnaire.import(yamlFileName);
        checkSuccessAlert(duplicateNameWarning, "UNIQUE constraint failed: Questionnaire.Name");
        closeModalWindow();
    });

    it("Delete questionnaire", function () {
        AssessmentQuestionnaire.delete(fileName);
        checkSuccessAlert(
            duplicateNameWarning,
            `Success alert:Questionnaire ${fileName} was successfully deleted.`,
            true
        );
    });
});
