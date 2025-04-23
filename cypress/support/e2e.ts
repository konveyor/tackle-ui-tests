/*
 * Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Import commands.js using ES2015 syntax:
import "./commands";

//Cypress-react-selector
import "cypress-react-selector";

// For more information, see: https://github.com/javierbrea/cypress-fail-fast/blob/main/README.md
import "cypress-fail-fast";

// Alternatively you can use CommonJS syntax:
// require('./commands')
require("cypress-xpath"); // Refer - https://www.npmjs.com/package/cypress-xpath

// load and register the grep feature
// https://github.com/bahmutov/cypress-grep
require("cypress-grep")();

// Load cypress-log-filter-plugin
// https://github.com/Brugui7/cypress-log-filter
require("cypress-log-filter");

// Allows to handle special actions like drag-n-drop
// The use of this library is limited to Chromium-based browsers
// https://github.com/dmtrKovalenko/cypress-real-events
import "cypress-real-events";
import { login } from "../utils/utils";

/** Hide XHR logs line */
// TODO: Improve by implementing a configuration parameter
const app = window.top;

if (app && !app.document.head.querySelector("[data-hide-command-log-request]")) {
    const style = app.document.createElement("style");
    style.innerHTML = ".command-name-request, .command-name-xhr { display: none }";
    style.setAttribute("data-hide-command-log-request", "");

    app.document.head.appendChild(style);
}

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Drags an element to a drop location.
             * This custom command works only on Chromium-based browsers
             * @example cy.dragAndDrop(cy.get('#source'), cy.get('#target'))
             * @param dragElement
             * @param dropElement
             */
            dragAndDrop(dragElement: Cypress.Chainable, dropElement: Cypress.Chainable): void;
        }
    }
}

beforeEach(() => {
    // Disable for static report test as it need to open local files
    if (Cypress.spec.name === "static_report.test.ts") {
        return;
    }

    login();
    // Every test starts by visiting / which should redirect to baseURL/applications
    cy.visit("/");
});
