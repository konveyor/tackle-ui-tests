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
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

require("cy-verify-downloads").addCustomCommand();
require("cypress-downloadfile/lib/downloadFileCommand");

export {};
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

            /**
             * Look for the UI's `window._env` data on the application's page, decode it, and
             * provide the data as a Chainable response.
             */
            uiEnvironmentConfig(): Cypress.Chainable<object>;
        }
    }
}

Cypress.Commands.add(
    "dragAndDrop",
    (dragElement: Cypress.Chainable, dropElement: Cypress.Chainable) => {
        dragElement
            .realMouseDown({ button: "left", position: "center" })
            .realMouseMove(0, 10, { position: "center" })
            .wait(200);
        dropElement.realMouseMove(0, 0, { position: "topLeft" }).realMouseUp().wait(200);
    }
);

Cypress.Commands.add("uiEnvironmentConfig", () =>
    cy.request("/").then<object>((resp) => {
        expect(resp.status).to.eq(200);

        cy.log("Looking for _env in UI's index.html");
        const htmlBody = resp.body;
        const windowEnv = htmlBody.match(/window\._env\s*=\s*"(.*?)"/);
        expect(windowEnv, "Find _env in index.html").to.not.be.null;

        const env = JSON.parse(atob(windowEnv[1]));
        cy.log("window._env: ", JSON.stringify(env));
        return cy.wrap(env);
    })
);
