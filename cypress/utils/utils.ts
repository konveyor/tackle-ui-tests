import * as loginView from '../integration/views/login.view';

const userName = Cypress.env('user');
const userPassword = Cypress.env('pass');
const tackleUiUrl = Cypress.env('tackleUrl');

export function inputText(fieldId: string, text: string): void {
  cy.get(fieldId).clear().type(text);
}

export function clickByText(fieldId: string, buttonText: string): void {
  cy.contains(fieldId, buttonText).click();
}

export function click(fieldId: string): void {
  cy.get(fieldId).click();
}

export function login(): void {
  cy.visit(tackleUiUrl);
  inputText(loginView.userNameInput, userName);
  inputText(loginView.userPasswordInput, userPassword);
  click(loginView.loginButton);
  cy.get('h1').contains('Application inventory');
}
