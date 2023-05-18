import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { deleteByList, getRandomApplicationData, login, logout } from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";
import { RbacValidationRules } from "../../types/types";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import * as data from "../../../utils/data_utils";

describe(["@tier2"], "Architect RBAC operations", function () {
    let userArchitect = new UserArchitect(getRandomUserData());
    const application = new Assessment(getRandomApplicationData());
    let stakeholdersList: Array<Stakeholders> = [];
    let stakeholderNameList: Array<string> = [];

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", function () {
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
        User.loginKeycloakAdmin();
        userArchitect.create();
    });

    beforeEach("Persist session", function () {
        // login as architect
        userArchitect.login();

        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
    });

    it("Architect, validate create application button", function () {
        //Architect is allowed to create applications
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Architect, validate assess application button", function () {
        //Architect is allowed to create applications
        Application.validateAssessButton(this.rbacRules);
    });

    it("Architect, validate review application button", function () {
        //Architect is allowed to review applications
        Application.validateReviewButton(this.rbacRules);
    });

    it("Architect, validate presence of import and manage imports", function () {
        //Architect is allowed to import applications
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Architect, validate presence of analyse button", function () {
        //Architect is allowed to analyse applications
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Architect, validate analysis details and cancel analysis buttons presence", function () {
        application.validateAnalysisAvailableActions(this.rbacRules);
    });

    it("Architect, validate assessment context menu buttons presence", function () {
        application.validateAssessmentAvailableOptions(this.rbacRules);
    });

    it("Architect, validate availability of binary upload functionality", function () {
        application.validateUploadBinary(this.rbacRules);
    });

    after("", function () {
        userArchitect.logout();
        login();
        appCredentials.delete();
        application.delete();
        deleteByList(stakeholdersList);
        logout();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
