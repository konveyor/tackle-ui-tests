// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands';
import { userNameInput, userPasswordInput, LoginButton } from '../integration/views/login.view';

const tackle_ui_url = Cypress.env('tackleUrl');

Cypress.Commands.add('login', (username, password) => {
    cy.visit(tackle_ui_url)
    cy.get(userNameInput).clear().type(username)
    cy.get(userPasswordInput).clear().type(password)
    cy.get(LoginButton).click()
    cy.get('h1').contains('Application inventory')
})
