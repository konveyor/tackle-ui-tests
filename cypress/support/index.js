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

// load and register the grep feature
// https://github.com/bahmutov/cypress-grep
require('cypress-grep')();
