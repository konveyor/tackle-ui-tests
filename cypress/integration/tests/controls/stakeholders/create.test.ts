/// <reference types="cypress" />

import '../../../../support/index';
import { stakeholderTableRows, itemsPerPageSelector } from '../../../views/stakeholder.view';

const userName = Cypress.env('user');
const userPassword = Cypress.env('pass');
const tackleUiUrl = Cypress.env('tackleUrl');

var stakeholder;

describe('Create New Stakeholder', () => {
    before('Login and load data', function() {

        // Get stakeholder data object through random generator
        cy.task("stakeholderData").then((object) => {
            stakeholder = object;
        });

        // Perform login
        cy.login(userName, userPassword);

        // Interceptors
        cy.intercept('POST', '/api/controls/stakeholder*').as('postStakeholder');
        cy.intercept('GET', '/api/controls/stakeholder*').as('getStakeholders');

        // Ensure Stakeholders page is opened
        cy.visit(tackleUiUrl + '/controls/stakeholders');
        cy.get('span.pf-c-tabs__item-text').should('contain', 'Stakeholders');
    });

    it('Single stakeholder with email and display name', function() {
        cy.createStakeholderMin(stakeholder);

        // Wait untill stakeholder create api is executed
        cy.wait('@postStakeholder');

        //Select max(100) number of items to display from table per page
        cy.selectItemsPerPage(100);
        cy.wait('@getStakeholders');

        // Assert that newly created stakeholder exists
        cy.get(stakeholderTableRows).get('td[data-label=Email]').should('contain', stakeholder.email);
        cy.get(stakeholderTableRows).get('td[data-label="Display name"]').should('contain', stakeholder.displayName);
    });
});
