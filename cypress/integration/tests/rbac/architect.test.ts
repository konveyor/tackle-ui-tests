import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { getRandomApplicationData, login, logout, preservecookies } from "../../../utils/utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { Application } from "../../models/developer/applicationinventory/application";
import { RbacValidationRules } from "../../types/types";
import { Stakeholders } from "../../models/developer/controls/stakeholders";
import { Assessment } from "../../models/developer/applicationinventory/assessment";
import * as data from "../../../utils/data_utils";

describe("Architect RBAC operations", () => {
    let userArchitect = new UserArchitect(getRandomUserData());
    const application = new Assessment(getRandomApplicationData());
    let stakeholdersList: Array<Stakeholders> = [];
    let stakeholderNameList: Array<string> = [];
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
        "analysis applicable options": {
            "Analysis details": true,
            "Cancel analysis": true,
            "Manage credentials": true,
            Delete: true,
        },
        "assessment applicable options": {
            "Discard assessment": true,
            "Copy assessment": true,
            "Manage dependencies": true,
        },
    };

    before("Creating RBAC users, adding roles for them", () => {
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
        application.validateAnalysisAvailableActions(rbacRules);
    });

    it("Login as architect and validate assessment context menu buttons presence", () => {
        application.validateAssessmentAvailableOptions(rbacRules);
    });

    after("", () => {
        userArchitect.logout();
        login(adminUserName, adminUserPassword);
        appCredentials.delete();
        application.delete();
        stakeholdersList.forEach((stakeholder) => {
            stakeholder.delete();
        });
        logout("admin");
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
