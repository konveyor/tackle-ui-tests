import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import {
    deleteByList,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    logout,
    preservecookies,
} from "../../../utils/utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { RbacValidationRules } from "../../types/types";
import { Application } from "../../models/developer/applicationinventory/application";
import { Assessment } from "../../models/developer/applicationinventory/assessment";
import { Stakeholders } from "../../models/developer/controls/stakeholders";
import * as data from "../../../utils/data_utils";

describe("Migrator RBAC operations", { tags: "@tier2" }, () => {
    let userMigrator = new UserMigrator(getRandomUserData());
    const application = new Assessment(getRandomApplicationData());
    let stakeholdersList: Array<Stakeholders> = [];
    let stakeholderNameList: Array<string> = [];
    let adminUserName = Cypress.env("user");
    let adminUserPassword = Cypress.env("pass");

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    const rbacRules: RbacValidationRules = {
        "Create new": false,
        Analyze: true,
        "Upload binary": true,
        Assess: false,
        Review: false,
        "Action menu": {
            "Not available": true,
            Import: false,
            "Manage imports": false,
            "Manage credentials": false,
            Delete: false,
        },
        "analysis applicable options": {
            "Analysis details": true,
            "Cancel analysis": true,
            "Manage credentials": false,
            Delete: false,
        },
        "assessment applicable options": {
            "Discard assessment": false,
            "Copy assessment": false,
            "Manage dependencies": true,
        },
    };

    before("Creating RBAC users, adding roles for them", () => {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;
        //Need to log in as admin and create simple app with known name to use it for tests
        login();
        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        stakeholdersList.push(stakeholder);
        stakeholderNameList.push(stakeholder.name);

        appCredentials.create();
        application.create();
        application.perform_assessment("low", stakeholderNameList);
        logout("admin");
        //Logging in as keycloak admin to create migrator user and test it
        User.loginKeycloakAdmin();
        userMigrator.create();
        userMigrator.login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Migrator, validate create application button", () => {
        //Migrator is not allowed to create applications
        Application.validateCreateAppButton(rbacRules);
    });

    it("Migrator, validate assess application button", () => {
        //Migrator is not allowed to create applications
        Application.validateAssessButton(rbacRules);
    });

    it("Migrator, validate review application button", () => {
        //Migrator is not allowed to review applications
        Application.validateReviewButton(rbacRules);
    });

    it("Migrator, validate presence of import and manage imports", () => {
        //migrator is allowed to import applications
        Analysis.validateTopActionMenu(rbacRules);
    });

    it("Migrator, validate presence of analyse button", () => {
        //Migrator is allowed to analyse applications
        Analysis.validateAnalyzeButton(rbacRules);
    });

    it("Migrator, validate analysis details and cancel analysis buttons presence", () => {
        application.validateAnalysisAvailableActions(rbacRules);
    });

    it("Migrator, validate assessment context menu buttons presence", () => {
        application.validateAssessmentAvailableOptions(rbacRules);
    });
    it("Migrator, validate availability of binary upload functionality", () => {
        application.validateUploadBinary(rbacRules);
    });

    after("", () => {
        if (hasToBeSkipped("@tier2")) return;
        userMigrator.logout();
        login(adminUserName, adminUserPassword);
        appCredentials.delete();
        application.delete();
        deleteByList(stakeholdersList);
        logout("admin");
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
