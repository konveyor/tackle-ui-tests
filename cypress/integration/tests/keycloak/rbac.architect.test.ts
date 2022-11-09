import { User } from "../../models/keycloak/users/user";
import { getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { preservecookies } from "../../../utils/utils";

describe("Keycloak operations", () => {
    let userArchitect = new UserArchitect(getRandomUserData());

    before("Creating RBAC users, adding roles for them", () => {
        User.loginKeycloakAdmin();
        userArchitect.create();
        userArchitect.login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Login as architect and validate create application button", () => {
        userArchitect.validateCreateAppButton(true);
    });

    it("Login as architect and validate assess application button", () => {
        userArchitect.validateAssessButton(true);
    });

    it("Login as architect and validate presence of import and manage imports", () => {
        userArchitect.validateImport(true);
    });

    after("", () => {
        userArchitect.logout();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
