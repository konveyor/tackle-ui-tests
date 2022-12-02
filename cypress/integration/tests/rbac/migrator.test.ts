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
        cy.pause();
    });

    it("Login as migrator and validate create application button", () => {
        //Migrator is not allowed to create applications
        userMigrator.validateCreateAppButton(false);
    });

    it("Login as migrator and validate assess application button", () => {
        //Migrator is not allowed to create applications
        userMigrator.validateAssessButton(false);
    });

    it("Login as migrator and validate presence of import and manage imports", () => {
        //migrator is allowed to import applications
        userMigrator.validateImport(true);
    });

    it("Login as architect and validate presence of analyse button", () => {
        //Migrator is allowed to analyse applications
        userMigrator.validateAnalyzeButton(true);
    });

    after("", () => {
        cy.pause();
        userMigrator.logout();
        login(adminUserName, adminUserPassword);
        appCredentials.delete();
        application.delete();
        logout("admin");
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
