import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { deleteByList, getRandomApplicationData, login, logout } from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { RbacValidationRules } from "../../types/types";
import { Application } from "../../models/migration/applicationinventory/application";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import * as data from "../../../utils/data_utils";

describe(["@tier2"], "Migrator RBAC operations", () => {
    let userMigrator = new UserMigrator(getRandomUserData());
    const application = new Assessment(getRandomApplicationData());
    let stakeholdersList: Array<Stakeholders> = [];
    let stakeholderNameList: Array<string> = [];

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
        logout();
        //Logging in as keycloak admin to create migrator user and test it
        User.loginKeycloakAdmin();
        userMigrator.create();
    });

    beforeEach("Persist session", function () {
        // Login as Migrator
        userMigrator.login();
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
        userMigrator.logout();
        login();
        appCredentials.delete();
        application.delete();
        deleteByList(stakeholdersList);
        logout();
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
