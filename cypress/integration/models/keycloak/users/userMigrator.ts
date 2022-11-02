import { User } from "./user";
import { UserRoles } from "../../../types/constants";

export class UserMigrator extends User {
    create() {
        super.create();
        this.definePassword();
        this.addRole(UserRoles.migrator);
    }

    validateRbac() {
        this.validateCreateAppButton(false);
    }
}
