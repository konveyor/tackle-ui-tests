import { User } from "../../models/keycloak/users/user";
import { getRandomUserData } from "../../../utils/data_utils";

describe("", () => {
    it("", () => {
        User.loginAdmin();
        let user = new User(getRandomUserData());
        user.create();
        user.delete();
    });
});
