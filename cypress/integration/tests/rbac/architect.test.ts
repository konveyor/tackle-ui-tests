import { User } from "../../models/keycloak/users/user";
import { getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { preservecookies } from "../../../utils/utils";

describe("Architect RBAC operations", () => {
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
        //Architect is allowed to create applications
        userArchitect.validateCreateAppButton(true);
    });

    it("Login as architect and validate assess application button", () => {
        //Architect is allowed to do assessments
        userArchitect.validateAssessButton(true);
    });

    it("Login as architect and validate presence of import and manage imports", () => {
        //Architect is allowed to import applications
        userArchitect.validateImport(true);
    });

    it("Login as architect and validate presence of analyse button", () => {
        //Architect is allowed to analyse applications
        userArchitect.validateAnalyzeButton(true);
    });

    after("", () => {
        userArchitect.logout();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
