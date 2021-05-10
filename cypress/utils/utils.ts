import * as loginView from "../integration/views/login.view";
import * as commonView from "../integration/views/commoncontrols.view";

const userName = Cypress.env("user");
const userPassword = Cypress.env("pass");
const tackleUiUrl = Cypress.env("tackleUrl");

export function inputText(fieldId: string, text: string): void {
    cy.get(fieldId).clear().type(text);
}

export function clickByText(fieldId: string, buttonText: string): void {
    cy.contains(fieldId, buttonText).click();
}

export function click(fieldId: string): void {
    cy.get(fieldId).click();
}

export function submitForm(): void {
    cy.get(commonView.submitButton).should("not.be.disabled");
    cy.get(commonView.controlsForm).submit();
}

export function login(): void {
    cy.visit(tackleUiUrl);
    inputText(loginView.userNameInput, userName);
    inputText(loginView.userPasswordInput, userPassword);
    click(loginView.loginButton);
    cy.get("h1").contains("Application inventory");
}

export function selectItemsPerPage(items: number): void {
    cy.get(commonView.itemsPerPageMenu).find(commonView.itemsPerPageToggleButton).eq(0).click();
    cy.get(commonView.itemsPerPageMenuOptions);
    cy.get(`li > button[data-action="per-page-${items}"]`).click();
}

export function selectMember(fieldId: string, memberName: string): void {
    cy.get(fieldId).click();
    cy.contains("button", memberName).click();
}
