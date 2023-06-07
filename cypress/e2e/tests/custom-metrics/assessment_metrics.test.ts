import {
    createMultipleApplications,
    createMultipleStakeholders,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    login,
} from "../../../utils/utils";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
import { Stakeholders } from "../../models/migration/controls/stakeholders";

let applicationList: Array<Assessment> = [];
let metrics = new Metrics();
let stakeholdersList: Array<Stakeholders> = [];

describe(["@tier2"], "Custom Metrics - The total number of initiated assessments", function () {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Navigate to Application inventory tab, delete all applications
        deleteApplicationTableRows();

        // Navigate to stakeholders control tab and create new stakeholder
        stakeholdersList = createMultipleStakeholders(1);

        // Create 2 applications
        applicationList = createMultipleApplications(2);
    });

    it("Perform Assessment-Validate metrics assessment count increased", function () {
        let count = applicationList.length;

        // Perform assessment of application
        for (let i = 0; i < applicationList.length; i++) {
            applicationList[i].perform_assessment("low", [stakeholdersList[0].name]);
            cy.wait(2000);
            applicationList[i].verifyStatus("assessment", "Completed");
        }

        // Validate the assessment initiated count increased
        metrics.validateAssessmentsInitiated(count);
    });

    it("Perform Review-No impact on assessment count", function () {
        let count = applicationList.length;

        // Perform application review
        applicationList[1].perform_review("medium");
        cy.wait(2000);
        applicationList[1].verifyStatus("review", "Completed");

        // Validate the assessment initiated count doesn't change
        metrics.validateAssessmentsInitiated(count);
    });

    it("Discard Assessment-Validate metrics assessment count doesn't change ", function () {
        let count = applicationList.length;

        // Discard assessment of application
        applicationList[0].verifyStatus("assessment", "Completed");
        applicationList[0].discard_assessment();

        // Validate the assessment initiated count doesn't change
        metrics.validateAssessmentsInitiated(count);
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        deleteAllStakeholders();
    });
});
