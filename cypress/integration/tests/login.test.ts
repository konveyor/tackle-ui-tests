/// <reference types="cypress" />

const userName = Cypress.env('user');
const userPassword = Cypress.env('pass');

describe('Log In', () => {

    it('Login to Pathfinder', () => {
        cy.login(userName, userPassword);
        cy.get('h1').should('contain', 'Application inventory')
    });
});