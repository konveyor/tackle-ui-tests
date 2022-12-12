import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    logout,
    preservecookies,
} from "../../../utils/utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { RbacValidationRules } from "../../types/types";
import { Application } from "../../models/developer/applicationinventory/application";

describe("Migrator RBAC operations", () => {
    let userMigrator = new UserMigrator(getRandomUserData());
    const application = new Analysis(
        getRandomApplicationData("bookServerApp"),
        getRandomAnalysisData({
            source: "Source code",
            target: ["Containerization"],
            appName: "book-server",
            storyPoints: 5,
        })
    );
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
        "applicable options": {
            "Analysis details": true,
            "Cancel analysis": true,
            "Manage credentials": false,
            Delete: false,
        },
    };

    before("Creating RBAC users, adding roles for them", () => {
        //Need to log in as admin and create simple app with known name to use it for tests
        login();
        appCredentials.create();
        application.create();
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

    it("Login as migrator and validate create application button", () => {
        //Migrator is not allowed to create applications
        Application.validateCreateAppButton(rbacRules);
    });

    it("Login as migrator and validate assess application button", () => {
        //Migrator is not allowed to create applications
        Application.validateAssessButton(rbacRules);
    });

    it("Login as migrator and validate presence of import and manage imports", () => {
        //migrator is allowed to import applications
        Analysis.validateTopActionMenu(rbacRules);
    });

    it("Login as migrator and validate presence of analyse button", () => {
        //Migrator is allowed to analyse applications
        Analysis.validateAnalyzeButton(rbacRules);
    });

    it("Login as migrator and validate analysis details and cancel analysis buttons presence", () => {
        application.validateAvailableActions(rbacRules);
    });

    after("", () => {
        userMigrator.logout();
        login(adminUserName, adminUserPassword);
        appCredentials.delete();
        application.delete();
        logout("admin");
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
