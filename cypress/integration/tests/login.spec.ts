const user_name = Cypress.env('username');
const user_password = Cypress.env('pass');

describe('Log In', () => {

    it('Login to pathfinder', () => {
        cy.login(user_name, user_password)
        cy.get('h1').should('contain', 'Application inventory')
    });
});