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

    login();

    // Every test starts by visiting / which should redirect to baseURL/applications
    cy.visit("/");
});
