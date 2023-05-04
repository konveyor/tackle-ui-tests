import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import {
    deleteByList,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    logout,
    preservecookies,
} from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";
import { RbacValidationRules } from "../../types/types";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import * as data from "../../../utils/data_utils";

describe(["@tier2"], "Architect RBAC operations", () => {
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
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;
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

    it("Architect, validate create application button", () => {
        //Architect is allowed to create applications
        Application.validateCreateAppButton(rbacRules);
    });

    it("Architect, validate assess application button", () => {
        //Architect is allowed to create applications
        Application.validateAssessButton(rbacRules);
    });

    it("Architect, validate review application button", () => {
        //Architect is allowed to review applications
        Application.validateReviewButton(rbacRules);
    });

    it("Architect, validate presence of import and manage imports", () => {
        //Architect is allowed to import applications
        Analysis.validateTopActionMenu(rbacRules);
    });

    it("Architect, validate presence of analyse button", () => {
        //Architect is allowed to analyse applications
        Analysis.validateAnalyzeButton(rbacRules);
    });

    it("Architect, validate analysis details and cancel analysis buttons presence", () => {
        application.validateAnalysisAvailableActions(rbacRules);
    });

    it("Architect, validate assessment context menu buttons presence", () => {
        application.validateAssessmentAvailableOptions(rbacRules);
    });

    it("Architect, validate availability of binary upload functionality", () => {
        application.validateUploadBinary(rbacRules);
    });

    after("", () => {
        if (hasToBeSkipped("@tier2")) return;
        userArchitect.logout();
        login(adminUserName, adminUserPassword);
        appCredentials.delete();
        application.delete();
        deleteByList(stakeholdersList);
        logout("admin");
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
