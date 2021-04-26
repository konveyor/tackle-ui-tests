import{ userNameInput, userPasswordInput, LoginButton } from '../views/login.view'

const user_password = Cypress.env('pass');

describe('Log In', () => {

    it('Login to pathfinder', () => {
        cy.visit("https://tackle-mta-pathfinder.apps.ocp4.prod.psi.redhat.com")
        cy.get(userNameInput).clear().type("alice")
        cy.get(userPasswordInput).clear().type(user_password)
        cy.get(LoginButton).click()
        cy.get(".nav").contains("Application inventory")
    });
});