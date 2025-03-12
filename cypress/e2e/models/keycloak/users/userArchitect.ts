import { UserRoles } from "../../../types/constants";
import { User } from "./user";

export class UserArchitect extends User {
    create() {
        super.create();
        cy.log("!---<<<<< Creation is completed");
        this.definePassword();
        this.addRole(UserRoles.architect);
    }
}
