import '@testing-library/cypress/add-commands';
import { createStakeholderButton, stakeholderEmailInput, stakeholderNameInput, 
         jobFunctionInput, groupInput, stakeholderFormButton, 
         stakeholderTable, stakeholderTableRows, 
         confirmButton } from '../integration/views/stakeholder.view';
import { itemsPerPageSelector } from '../integration/views/common.view';
import { createNewStakeholdergroupButton, stakeholdergroupNameInput, stakeholdergroupDescriptionInput, 
         stakeholdergroupCreateButton, confirmDeleteButton} from '../integration/views/stakeholdergroups.view';

// -- Create new stakeholder with min data (name and email) --
Cypress.Commands.add('createStakeholderMin', (stakeholderData) => {
    cy.get(createStakeholderButton).click();
    cy.get(stakeholderEmailInput).clear().type(stakeholderData.email);
    cy.get(stakeholderNameInput).clear().type(stakeholderData.displayName);
    cy.get(stakeholderFormButton).should("not.be.disabled");
    cy.get('form.pf-c-form').submit();
});

// -- Create new stakeholder group with minimum data (name and description) --
Cypress.Commands.add('createStakeholdergroupMin', (stakeholdergroup) => {
    cy.get(createNewStakeholdergroupButton).click();
    cy.get(stakeholdergroupNameInput).clear().type(stakeholdergroup.name);
    cy.get(stakeholdergroupDescriptionInput).clear().type(stakeholdergroup.description);
    cy.get(stakeholdergroupCreateButton).should("not.be.disabled");
    cy.get('form.pf-c-form').submit();
});

// -- Delete stakeholder group --
Cypress.Commands.add('deleteStakeholdergroup', (stakeholdergroup) => {
    cy.get("table[aria-label='App table'] > tbody > tr").as('tableRows')
    cy.get('@tableRows').get('td[data-label=Name]').contains(stakeholdergroup.name).siblings('td[data-key=4]').find('button[aria-label=delete]').click()
    cy.get(confirmDeleteButton).click()
});

// -- Select items to display per page --
Cypress.Commands.add('selectItemsPerPage', (items) => {
    cy.get('div.pf-c-options-menu').find(itemsPerPageSelector).eq(0).click();
    cy.get('ul[aria-labelledby="pagination-options-menu-toggle"]');
    cy.get(`li > button[data-action="per-page-${items}"]`).click();
});