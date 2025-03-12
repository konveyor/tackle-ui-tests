/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { clickByText, selectItemsPerPage, selectUserPerspective } from "../../../../utils/utils";
import { applicationInventory, button, migration, SEC } from "../../../types/constants";
import { applicationsActionButton } from "../../../views/applicationinventory.view";
import { manageImportsActionsButton } from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";

export class ManageImports {
    static fullUrl = Cypress.config("baseUrl") + "applications/application-imports";

    public static open(forceReload = false): void {
        if (forceReload) {
            cy.visit(ManageImports.fullUrl, { timeout: 15 * SEC }).then((_) =>
                selectItemsPerPage(100)
            );
            return;
        }

        cy.url().then(($url) => {
            if ($url != ManageImports.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, applicationInventory);
                cy.get(applicationsActionButton).click({ force: true });
                clickByText(button, "Manage imports");
                cy.wait(5 * SEC)
                    .get("h1", { timeout: 5 * SEC })
                    .contains("Application imports");
            }
        });
    }

    public openErrorReport(): void {
        // Open error report for the first row
        cy.get("table > tbody > tr").eq(0).as("firstRow");
        cy.get("@firstRow").find(manageImportsActionsButton).click();
        cy.get("@firstRow").find(button).contains("View error report").click();
        cy.get("h1", { timeout: 5 * SEC }).contains("Error report");
    }

    public verifyAppImport(fileName: string, status: string, accepted: number, rejected): void {
        // Verify the app import features for a single row
        cy.get("table > tbody > tr").as("firstRow");
        cy.get("@firstRow").find("td[data-label='Filename']").should("contain", fileName);
        cy.get("@firstRow").find("td[data-label='Status']").find("div").should("contain", status);
        cy.get("@firstRow").find("td").eq(4).should("contain", accepted);
        cy.get("@firstRow").find("td").eq(5).should("contain", rejected);
    }

    public verifyImportErrorMsg(errorMsg: any): void {
        // Verifies if the error message appears in the error report table
        if (Array.isArray(errorMsg)) {
            errorMsg.forEach(function (message) {
                cy.get("table > tbody > tr > td").should("contain", message);
            });
        } else {
            cy.get("table > tbody > tr > td").should("contain", errorMsg);
        }
    }
}
