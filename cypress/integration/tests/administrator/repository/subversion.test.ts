import {
    deleteAllStakeholders,
    deleteApplicationTableRows,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../utils/utils";
import { Assessment } from "../../../models/developer/applicationinventory/assessment";
import { Stakeholders } from "../../../models/developer/controls/stakeholders";
import * as data from "../../../../utils/data_utils";
import { SubversionConfiguration } from "../../../models/administrator/repositories/subversion_configuration";

const stakeholdersList: Array<Stakeholders> = [];
const stakeholdersNameList: Array<string> = [];
let subversionConfiguration = new SubversionConfiguration();
let application;

describe("Test an application form a subversion source", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        deleteApplicationTableRows();
        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
    });

    after("Perform test data clean up", () => {
        if (hasToBeSkipped("@tier1")) return;
        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
    });

    it("Enable Insecure subversion Repository", () => {
        SubversionConfiguration.open();
        subversionConfiguration.toggleInsecureSubversionRepositories();
    });

    it("Perform insecure subversion application assessment with low risk", function () {
        // Navigate to application inventory tab and create new application
        // create a new application
        application = new Assessment(getRandomApplicationData({ sourceData: this.appData[7] }));

        application.create();
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("low", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Disable insecure subversion Repository", () => {
        SubversionConfiguration.open();
        subversionConfiguration.toggleInsecureSubversionRepositories();
    });

    it("Perform secure subversion application assessment with low risk", function () {
        // Navigate to application inventory tab and create new application
        // create a new application
        application = new Assessment(getRandomApplicationData({ sourceData: this.appData[5] }));

        application.create();
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("low", stakeholdersNameList);
        cy.wait(2000);
        application.is_assessed();

        // Delete application
        application.delete();
        cy.wait(2000);
    });
});
