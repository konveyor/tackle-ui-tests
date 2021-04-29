import '@testing-library/cypress/add-commands';
import { userNameInput, userPasswordInput, loginButton } from '../integration/views/login.view';

const tackleUiUrl = Cypress.env('tackleUrl');

// -- Perform user login into Tackle UI --
Cypress.Commands.add('login', (username, password) => {
    cy.visit(tackleUiUrl);
    cy.get(userNameInput).clear().type(username);
    cy.get(userPasswordInput).clear().type(password);
    cy.get(loginButton).click();
    cy.get('h1').contains('Application inventory');
});
