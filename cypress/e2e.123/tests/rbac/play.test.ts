import { login, logout } from "../../../utils/utils";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { getEmail, getRandomUserData, getRandomWord } from "../../../utils/data_utils";
import { Application } from "../../models/migration/applicationinventory/application";
import { Assessment } from "../../models/migration/applicationinventory/assessment";

describe(["@tier2"], "Architect RBAC operations", () => {
    let userArchitect = new UserArchitect({
        username: "architect",
        password: "Dog8code",
        firstName: "firstName",
        lastName: "lastName",
        email: "test@gmail.com",
        userEnabled: true,
    });
    let adminUserName = Cypress.env("user");
    let adminUserPassword = Cypress.env("pass");

    before("Creating RBAC users, adding roles for them", () => {
        login(adminUserName, adminUserPassword);
        logout("admin");
        cy.log("<<<-----------Logged out from admin");
        User.loginKeycloakAdmin();
        cy.log("<<<-----------Logged in as Keycloak admin");
        // userArchitect.create();
        cy.log("<<<-----------Created new Keycloak user");
        // userArchitect.login();
        // cy.log("<<<-----------Logged in as new Keycloak user");
        cy.clearLocalStorage();
    });

    beforeEach("", () => {
        userArchitect.login();
    });

    it("Architect, validate create application button", () => {
        Assessment.open();
        //Architect is allowed to create applications
        // Application.validateCreateAppButton(rbacRules);
    });
});
