// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import {
    applicationinventory,
    button,
    deleteAction,
    tdTag,
    trTag,
} from "../integration/types/constants";
import { actionButton } from "../integration/views/applicationinventory.view";
import { navMenu } from "../integration/views/menu.view";
import {
    click,
    clickByText,
    deleteApplicationTableRows,
    login,
    logout,
    selectItemsPerPage,
} from "../utils/utils";
import * as commonView from "../integration/views/common.view";
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')
require("cypress-xpath"); // Refer - https://www.npmjs.com/package/cypress-xpath

before("Login and Clean up Application Inventory Table Data", function () {
    // Login
    login();
    cy.wait(2000);

    // Navigate to application inventory tab
    clickByText(navMenu, applicationinventory);
    cy.wait(2000);

    // Select 100 items per page
    selectItemsPerPage(100);
    cy.wait(2000);

    // Check if the application inventory table is empty, else delete the existing rows
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                // Delete all items of page
                deleteApplicationTableRows();
            }
        });

    // Logout
    logout();
});
