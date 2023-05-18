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

        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["migrator"];
        });
    });

    it("Migrator, validate create application button", function () {
        //Migrator is not allowed to create applications
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Migrator, validate assess application button", function () {
        //Migrator is not allowed to create applications
        Application.validateAssessButton(this.rbacRules);
    });

    it("Migrator, validate review application button", function () {
        //Migrator is not allowed to review applications
        Application.validateReviewButton(this.rbacRules);
    });

    it("Migrator, validate presence of import and manage imports", function () {
        //migrator is allowed to import applications
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Migrator, validate presence of analyse button", function () {
        //Migrator is allowed to analyse applications
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Migrator, validate analysis details and cancel analysis buttons presence", function () {
        application.validateAnalysisAvailableActions(this.rbacRules);
    });

    it("Migrator, validate assessment context menu buttons presence", function () {
        application.validateAssessmentAvailableOptions(this.rbacRules);
    });
    it("Migrator, validate availability of binary upload functionality", function () {
        application.validateUploadBinary(this.rbacRules);
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
