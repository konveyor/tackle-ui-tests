import { UserRoles } from "../../../types/constants";
import { User } from "./user";

export class UserArchitect extends User {
    create() {
        User.changeRealm("mta");
        super.create();
        this.definePassword();
        this.addRole(UserRoles.architect);
    }
}
