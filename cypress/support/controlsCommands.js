import '@testing-library/cypress/add-commands';
import { createStakeholderButton, stakeholderEmailInput, stakeholderNameInput, 
         jobFunctionInput, groupInput, stakeholderFormButton, 
         stakeholderTable, stakeholderTableRows, 
         confirmButton, itemsPerPageSelector } from '../integration/views/stakeholder.view';

// -- Create new stakeholder with min data (name and email) --
Cypress.Commands.add('createStakeholderMin', (stakeholderData) => {
    cy.get(createStakeholderButton).click();
    cy.get(stakeholderEmailInput).clear().type(stakeholderData.email);
    cy.get(stakeholderNameInput).clear().type(stakeholderData.displayName);
    cy.get(stakeholderFormButton).should("not.be.disabled");
    cy.get('form.pf-c-form').submit();
});

// -- Select items to display per page --
Cypress.Commands.add('selectItemsPerPage', (items) => {
    cy.get('div.pf-c-options-menu').find(itemsPerPageSelector).eq(0).click();
    cy.get('ul[aria-labelledby="pagination-options-menu-toggle"]');
    cy.get(`li > button[data-action="per-page-${items}"]`).click();
});