import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { login } from "../../../../../utils/utils";

const fileName = "questionnaire_import/cloud-native.yaml";

describe(["@tier1"], "Application assessment and review tests", () => {
    // Need to be unskipped when bug MTA-1449 is fixed . All test are failing .
    it("Login and Create Test Data", function () {
        login();

        /*
        AssessmentQuestionnaire.importQuestionnaire(fileName);
        AssessmentQuestionnaire.exportQuestionnaire("Cloud Native");
        AssessmentQuestionnaire.viewQuestionnaire("Cloud Native");
        AssessmentQuestionnaire.deleteQuestionnaire("Cloud Native"); */
        AssessmentQuestionnaire.enable("Cloud Native", false);
    });
});
