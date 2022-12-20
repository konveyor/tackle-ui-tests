import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
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
import { Application } from "../../models/developer/applicationinventory/application";
import { RbacValidationRules } from "../../types/types";

describe("Architect RBAC operations", () => {
    let userArchitect = new UserArchitect(getRandomUserData());
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
        "Create new": true,
        Analyze: true,
        "Upload binary": true,
        Assess: true,
        Review: true,
        "Action menu": {
            "Not available": false,
            Import: true,
            "Manage imports": true,
            "Manage credentials": true,
            Delete: true,
        },
        "applicable options": {
            "Analysis details": true,
            "Cancel analysis": true,
            "Manage credentials": true,
            Delete: true,
        },
    };

    before("Creating RBAC users, adding roles for them", () => {
        login();
        appCredentials.create();
        application.create();
        logout("admin");
        User.loginKeycloakAdmin();
        userArchitect.create();
        userArchitect.login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Login as architect and validate create application button", () => {
        //Architect is allowed to create applications
        Application.validateCreateAppButton(rbacRules);
    });

    it("Login as architect and validate assess application button", () => {
        //Architect is allowed to create applications
        Application.validateAssessButton(rbacRules);
    });

    it("Login as architect and validate presence of import and manage imports", () => {
        //Architect is allowed to import applications
        Analysis.validateTopActionMenu(rbacRules);
    });

    it("Login as architect and validate presence of analyse button", () => {
        //Architect is allowed to analyse applications
        Analysis.validateAnalyzeButton(rbacRules);
    });

    it("Login as architect and validate analysis details and cancel analysis buttons presence", () => {
        application.validateAvailableActions(rbacRules);
    });

    after("", () => {
        userArchitect.logout();
        login(adminUserName, adminUserPassword);
        appCredentials.delete();
        application.delete();
        logout("admin");
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
