import {
    click,
    clickByText,
    deleteFromArray,
    inputText,
    login,
    logout,
} from "../../../../utils/utils";
import { button, SEC, tdTag, trTag } from "../../../types/constants";
import { UserData } from "../../../types/types";
import * as loginView from "../../../views/login.view";
const tackleUiUrl = Cypress.env("tackleUrl");
const keycloakAdminPassword = Cypress.env("keycloakAdminPassword");

export class User {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    userEnabled: boolean;
    roles = [""];
    firstLogin: boolean;

    constructor(userData: UserData) {
        const { username, password, firstName, lastName, email, userEnabled } = userData;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userEnabled = userEnabled;
        this.firstLogin = true;
    }

    static keycloakUrl = tackleUiUrl + "/auth/";

    static loginKeycloakAdmin(loggedIn = false): void {
        cy.visit(User.keycloakUrl, { timeout: 120 * SEC });
        cy.contains("h1", "Welcome to", { timeout: 120 * SEC }); // Make sure that welcome page opened and loaded
        clickByText("a", "Administration Console");
        // This is required to be skipped if admin user is logged in already to keycloak
        if (!loggedIn) {
            cy.get("h1").then(($isloggedIn) => {
                // Due to session sometimes console auto logs in, hence this check is necessary
                if ($isloggedIn.text().toString().trim() === "Sign in to your account") {
                    cy.get("#kc-header-wrapper", { timeout: 240 * SEC }); // Make sure that login page opened and loaded
                    inputText(loginView.userNameInput, "admin");
                    inputText(loginView.userPasswordInput, keycloakAdminPassword);
                    click(loginView.loginButton);
                }
            });
        }
    }

    static openList(): void {
        clickByText("a", "Users");
        click("#viewAllUsers");
        cy.wait(SEC);
    }

    protected static applyAction(itemName, action: string): void {
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(itemName, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                clickByText(tdTag, action);
                cy.wait(500);
            });
        if (action.toLowerCase() === "delete") {
            click(
                "body > div.modal.fade.ng-isolate-scope.in > div > div > div.modal-footer.ng-scope > button.ng-binding.btn.btn-danger"
            );
        }
    }

    protected navigateToSection(section: string) {
        clickByText("a", section);
    }

    protected inputUsername(username: string) {
        inputText(loginView.userNameInput, username);
    }

    protected inputFirstname(firstName: string) {
        inputText("#firstName", firstName);
    }

    protected inputLastname(lastName: string) {
        inputText("#lastName", lastName);
    }

    protected inputEmail(email: string) {
        inputText("#email", email);
    }

    protected inputPassword(password: string) {
        inputText("#newPas", password);
        inputText("#confirmPas", password);
    }

    create(): void {
        User.openList();
        click("#createUser");
        this.inputUsername(this.username);
        this.inputEmail(this.email);
        this.inputFirstname(this.firstName);
        this.inputLastname(this.lastName);
        clickByText(button, "Save");
    }

    delete(): void {
        User.openList();
        User.applyAction(this.username, "Delete");
    }

    definePassword(): void {
        User.openList();
        User.applyAction(this.username, "Edit");
        this.navigateToSection("Credentials");
        this.inputPassword(this.password);
        clickByText(button, "Set Password");
        clickByText(button, "Set password");
    }

    addRole(role: string): void {
        User.openList();
        User.applyAction(this.username, "Edit");
        this.navigateToSection("Role Mappings");
        cy.get("#available").select(role);
        clickByText(button, "Add selected");
        cy.wait(SEC);
        cy.get("#assigned").select(role);
        this.roles.push(role);
    }

    removeRole(role: string): void {
        User.openList();
        User.applyAction(this.username, "Edit");
        this.navigateToSection("Role Mappings");
        cy.get("#assigned").select(role);
        clickByText(button, "Remove selected");
        cy.wait(SEC);
        cy.get("#available").select(role);
        deleteFromArray(this.roles, role);
    }

    login(): void {
        login(this.username, this.password, this.firstLogin);
        if (this.firstLogin) {
            this.password = Cypress.env("pass");
            this.firstLogin = false;
        }
    }

    logout() {
        logout(this.username);
    }
}
