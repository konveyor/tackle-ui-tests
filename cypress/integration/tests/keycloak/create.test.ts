import { User } from "../../models/keycloak/users/user";
import { getRandomUserData } from "../../../utils/data_utils";
import { UserRoles } from "../../types/constants";

describe("Keycloak operations", () => {
    it("Create user, define password, add and remove roles, remove user", () => {
        User.loginAdmin();
        let user = new User(getRandomUserData());
        user.create();
        user.definePassword();
        user.addRole(UserRoles.migrator);
        user.addRole(UserRoles.architect);
        user.removeRole(UserRoles.migrator);
        user.delete();
    });
});
