import { User } from "./user";
import { UserRoles } from "../../../types/constants";

export class UserArchitect extends User {
    create() {
        super.create();
        this.definePassword();
        this.addRole(UserRoles.architect);
    }
}
