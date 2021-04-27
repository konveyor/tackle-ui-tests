import '../../../support/index'

const user_name = Cypress.env('username');
const user_password = Cypress.env('pass');
const tackle_ui_url = Cypress.env('tackleUrl');

describe('Stakeholders', () => {
    before('Login and load fixture', function() {
        cy.fixture('stakeholders').then((stakeholders) => {
            this.stakeholders = stakeholders
        })
        cy.login(user_name, user_password)
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder")
        cy.intercept("DELETE", "/api/controls/stakeholder/*").as("deleteStakeholder")
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholder");
        cy.visit(tackle_ui_url + '/controls/stakeholders')
        cy.get('span.pf-c-tabs__item-text').should('contain', 'Stakeholders')
    });

    it('Create New Stakeholders', function() {
        this.stakeholders.forEach(function (stakeholder_data) {
            cy.get('button[aria-label=create-stakeholder]').click()
            cy.get('input[name=email]').clear().type(stakeholder_data.email)
            cy.get('input[name=displayName]').clear().type(stakeholder_data.displayName)
            cy.get("[placeholder='Select a job function']").click().type(stakeholder_data.jobFunction)
            cy.get('[role=option]').contains(stakeholder_data.jobFunction).click()
            cy.get("[placeholder='Select a group']").click().type(stakeholder_data.group)
            cy.get('[role=option]').contains(stakeholder_data.group).click()
            cy.get('button[aria-label=submit]').click()
            cy.wait("@postStakeholder")
            cy.get("table[aria-label='App table'] > tbody > tr").get('td[data-label=Email]').should('contain', stakeholder_data.email)
            cy.get("table[aria-label='App table'] > tbody > tr").get("td[data-label='Display name']").should('contain', stakeholder_data.displayName)
        });
    });

    after('Delete created Stakeholders', function() {
        this.stakeholders.forEach(function (stakeholder_data) {
            cy.get("table[aria-label='App table'] > tbody > tr").as('tableRows')
            cy.get('@tableRows').get('td[data-label=Email]').contains(stakeholder_data.email).siblings('td[data-key=5]').find('button[aria-label=delete]').click()
            cy.get('button[aria-label=confirm]').click()
            cy.wait('@deleteStakeholder')
            //cy.wait('@getStakeholder')
            cy.wait(1000)
        })
    });
});