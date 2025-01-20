import { UserRoles } from "../../../types/constants";
import { User } from "./user";

export class UserMigrator extends User {
    create() {
        super.create();
        this.definePassword();
        this.addRole(UserRoles.migrator);
    }
}
