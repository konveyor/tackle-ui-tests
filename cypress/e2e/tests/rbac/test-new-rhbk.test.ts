import { getRandomUserData } from "../../../utils/data_utils";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";

describe(["@tag"], "Test login to new rbac", function () {
    it("Test login to new rbac", function () {
        let userArchitect = new UserArchitect(getRandomUserData());
        User.loginKeycloakAdmin();
        userArchitect.create();
    });
});
