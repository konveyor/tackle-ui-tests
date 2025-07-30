import {
    click,
    clickByText,
    deleteFromArray,
    getNamespace,
    inputText,
    login,
    logout,
} from "../../../../utils/utils";
import { button, SEC, tdTag, trTag } from "../../../types/constants";
import { UserData } from "../../../types/types";
import { modalConfirm } from "../../../views/common.view";
import * as loginView from "../../../views/login.view";
import {
    addUserButton,
    assignButton,
    assignRoleButton,
    checkBox,
    createPasswordButton,
    filterTypeDropdown,
    modalConfirmButton,
    passwordConfirm,
    passwordInput,
    saveUserButton,
    tempPasswordToggle,
} from "../../../views/rbac.view";
const tackleUiUrl = Cypress.config("baseUrl");
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
        // This is required to be skipped if admin user is logged in already to keycloak
        if (!loggedIn) {
            cy.get("h1", { timeout: 30 * SEC }).then(($isloggedIn) => {
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

    static changeRealm(realm: string) {
        cy.url().then(($url) => {
            if (!$url.includes(`#/${realm}`)) {
                click(loginView.realmSelector);
                clickByText(button, realm);
            }
        });
    }

    static openList(): void {
        const namespace = getNamespace();
        let realm = "tackle";
        if (namespace.includes("mta")) {
            realm = "mta";
        }
        User.changeRealm(realm);
        clickByText("a", "Users");
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
        click(`a[data-testid=${section}]`);
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
        inputText(passwordInput, password);
        inputText(passwordConfirm, password);
    }

    create(): void {
        User.openList();
        click(addUserButton);
        this.inputUsername(this.username);
        this.inputEmail(this.email);
        this.inputFirstname(this.firstName);
        this.inputLastname(this.lastName);
        click(saveUserButton);
    }

    delete(): void {
        User.openList();
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(this.username, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                click("input");
                cy.wait(500);
            });
        click(loginView.deleteUserButton);
        click(modalConfirm);
    }

    definePassword(): void {
        this.navigateToSection("credentials");
        click(createPasswordButton);
        this.inputPassword(this.password);
        click(tempPasswordToggle);
        click(modalConfirmButton);
        click(modalConfirmButton);
    }

    addRole(role: string): void {
        User.openList();
        clickByText("a", this.username);
        this.navigateToSection("role-mapping-tab");
        click(assignRoleButton);
        click(filterTypeDropdown);
        clickByText(button, "Filter by realm roles");
        cy.contains(tdTag, role)
            .closest(trTag)
            .within(() => {
                click(checkBox);
            });
        click(assignButton);
        cy.wait(SEC);
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
        cy.visit(Cypress.config("baseUrl"));
    }

    logout() {
        logout(this.username);
    }
}
