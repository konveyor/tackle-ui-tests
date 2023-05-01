import { User } from "./user";
import { UserRoles } from "../../../types/constants";

export class UserAdmin extends User {
    create() {
        super.create();
        this.definePassword();
        this.addRole(UserRoles.admin);
    }
}
