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

// commands from libraries
import "cypress-downloadfile/lib/downloadFileCommand";
import "cypress-fail-fast";
import "cypress-file-upload";
import "cypress-fs";
import "cypress-react-selector";
import "cypress-real-events";
require("cy-verify-downloads").addCustomCommand();

// plugins
import "cypress-log-filter";

// custom commands
import "./commands";

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

beforeEach(() => {
    // Disable for static report test as it need to open local files
    if (Cypress.spec.name === "static_report.test.ts") {
        return;
    }

    // Look for the window._env data on the application's page, decode it, and push the object
    // into a alias so other tests can check the UI's _env configuration.
    cy.request("/").then((resp) => {
        cy.log("Looking for _env in UI's index.html");
        expect(resp.status).to.eq(200);

        const htmlBody = resp.body;
        const windowEnv = htmlBody.match(/window\._env\s*=\s*"(.*?)"/);
        expect(windowEnv, "Find _env in index.html").to.not.be.null;

        const env = JSON.parse(atob(windowEnv[1]));
        cy.log("window._env: ", JSON.stringify(env));

        cy.wrap(env).as("environmentConfig");
    });

    login();

    // Every test starts by visiting / which should redirect to baseURL/applications
    cy.visit("/");
});
