import { User } from "../../models/keycloak/users/user";
import { getRandomUserData } from "../../../utils/data_utils";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { preservecookies } from "../../../utils/utils";

describe("Migrator RBAC operations", () => {
    let userMigrator = new UserMigrator(getRandomUserData());

    before("Creating RBAC users, adding roles for them", () => {
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
        userMigrator.validateCreateAppButton(false);
    });

    it("Login as migrator and validate assess application button", () => {
        //Mirator is not allowed to create applications
        userMigrator.validateAssessButton(false);
    });

    it("Login as migrator and validate presence of import and manage imports", () => {
        //migrator is allowed to import applications
        userMigrator.validateImport(true);
    });

    after("", () => {
        userMigrator.logout();
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
