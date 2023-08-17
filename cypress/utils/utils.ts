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
import { BusinessServices } from "../e2e/models/migration/controls/businessservices";
import { Stakeholders } from "../e2e/models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../e2e/models/migration/controls/stakeholdergroups";
import { Tag } from "../e2e/models/migration/controls/tags";
import { TagCategory } from "../e2e/models/migration/controls/tagcategory";
import { Jobfunctions } from "../e2e/models/migration/controls/jobfunctions";

import * as loginView from "../e2e/views/login.view";
import * as commonView from "../e2e/views/common.view";
import { navMenu, navTab } from "../e2e/views/menu.view";
import * as data from "../utils/data_utils";
import "cypress-file-upload";
import {
    businessService,
    tag,
    groupCount,
    memberCount,
    tagCount,
    tdTag,
    trTag,
    button,
    rank,
    criticality,
    priority,
    confidence,
    deleteAction,
    applicationInventory,
    SEC,
    CredentialType,
    UserCredentials,
    credentialType,
    artifact,
    repositoryType,
    analysis,
    owner,
    JiraType,
} from "../e2e/types/constants";
import { actionButton, date, createEntitiesCheckbox } from "../e2e/views/applicationinventory.view";
import {
    closeSuccessNotification,
    confirmButton,
    divHeader,
    firstPageButton,
    lastPageButton,
    modal,
    nextPageButton,
    pageNumInput,
    prevPageButton,
} from "../e2e/views/common.view";
import { tagLabels } from "../e2e/views/tags.view";
import { Credentials } from "../e2e/models/administration/credentials/credentials";
import { Assessment } from "../e2e/models/migration/applicationinventory/assessment";
import { analysisData, applicationData, JiraConnectionData, UserData } from "../e2e/types/types";
import { CredentialsProxy } from "../e2e/models/administration/credentials/credentialsProxy";
import {
    getJiraConnectionData,
    getJiraCredentialData,
    getRandomCredentialsData,
    randomWordGenerator,
} from "../utils/data_utils";
import { CredentialsMaven } from "../e2e/models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../e2e/models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../e2e/models/administration/credentials/credentialsSourceControlKey";
import { switchToggle } from "../e2e/views/reports.view";
import { MigrationWaveView } from "../e2e/views/migration-wave.view";
import Chainable = Cypress.Chainable;
import { MigrationWave } from "../e2e/models/migration/migration-waves/migration-wave";
import { Jira } from "../e2e/models/administration/jira-connection/jira";
import { JiraCredentials } from "../e2e/models/administration/credentials/JiraCredentials";
import { closeModal } from "../e2e/views/assessment.view";

const { _ } = Cypress;

export function inputText(fieldId: string, text: any, log = false): void {
    if (!log) {
        cy.log(`Type ${text} in ${fieldId}`);
    }
    cy.get(fieldId, { log }).click({ log }).focused({ log }).clear({ log });
    cy.wait(200, { log });
    cy.get(fieldId, { log }).clear({ log }).type(text, { log });
}

export function clearInput(fieldID: string): void {
    cy.get(fieldID).clear();
}

export function clickByText(
    fieldId: string,
    buttonText: string,
    isForced = true,
    log = false
): void {
    if (!log) {
        cy.log(`Click by text, id: ${fieldId}, text: ${buttonText}`);
    }
    // https://github.com/cypress-io/cypress/issues/2000#issuecomment-561468114
    cy.contains(fieldId, buttonText, { timeout: 60 * SEC, log }).click({
        force: isForced,
        log,
    });
    cy.wait(SEC, { log });
}

export function click(fieldId: string, isForced = true, log = false): void {
    if (!log) {
        cy.log(`Click ${fieldId}`);
    }
    cy.get(fieldId, { log, timeout: 60 * SEC }).click({ log, force: isForced });
}

export function submitForm(): void {
    cy.get(commonView.submitButton).should("not.be.disabled");
    cy.get(commonView.controlsForm).submit();
}

export function cancelForm(): void {
    cy.get(commonView.cancelButton).click();
}

export function login(username?, password?: string, firstLogin = false): Chainable<null> {
    /**
     *  If the login method is explicitly called, it means that previous sessions are no longer required
     */
    Cypress.session.clearAllSavedSessions();

    /**
     * The sessionId is used to create a new session or to try to recover a previous one
     */
    const sessionId = (username ?? "login") + (firstLogin ? "FirstLogin" : "");

    return cy.session(sessionId, () => {
        cy.log("Login in");
        cy.visit(Cypress.env("tackleUrl"), { timeout: 120 * SEC });
        cy.wait(5000);
        cy.get("h1", { timeout: 120 * SEC, log: false }).then(($title) => {
            if ($title.text().toString().trim() !== "Sign in to your account") {
                return;
            }

            const userName = username ?? Cypress.env("user");
            const userPassword = password ?? Cypress.env("pass");

            inputText(loginView.userNameInput, userName);
            inputText(loginView.userPasswordInput, userPassword);
            click(loginView.loginButton);

            // Change default password on first login.
            cy.get("span").then(($inputErr) => {
                if ($inputErr.text().toString().trim() === "Invalid username or password.") {
                    inputText(loginView.userPasswordInput, "Passw0rd!");
                    click(loginView.loginButton);
                    updatePassword();
                }
            });
        });

        updatePassword();
        cy.get("#main-content-page-layout-horizontal-nav").within(() => {
            cy.get("h1", { timeout: 15 * SEC, log: false }).contains("Application inventory");
        });
    });
}

export function updatePassword(): void {
    // Change password screen which appears only for first login
    // This is used in PR tester and Jenkins jobs.
    cy.get("h1", { timeout: 120 * SEC }).then(($a) => {
        if ($a.text().toString().trim() == "Update password") {
            inputText(loginView.changePasswordInput, "Dog8code");
            inputText(loginView.confirmPasswordInput, "Dog8code");
            click(loginView.submitButton);
        }
    });
}

export function logout(userName?: string): void {
    if (!userName) {
        userName = "admin";
    }
    clickByText(button, userName);
    cy.wait(0.5 * SEC);
    clickByText("a", "Logout");
    // cy.wait(4000);
    cy.get("h1", { timeout: 15 * SEC }).contains("Sign in to your account");
}

export function resetURL(): void {
    cy.url().then(($url) => {
        if ($url.includes("report") || $url.includes("tasks")) {
            login();
        }
    });
}

export function selectItemsPerPage(items: number): void {
    cy.log(`Select ${items} per page`);
    cy.get(commonView.itemsPerPageMenu, { timeout: 60 * SEC, log: false })
        .find(commonView.itemsPerPageToggleButton, { log: false })
        .then(($toggleBtn) => {
            if (!$toggleBtn.eq(0).is(":disabled")) {
                $toggleBtn.eq(0).trigger("click");
                cy.get(commonView.itemsPerPageMenuOptions, { log: false });
                cy.get(`li > button[data-action="per-page-${items}"]`, { log: false }).click({
                    force: true,
                    log: false,
                });
                cy.wait(2 * SEC);
            }
        });
}

export function selectFromDropList(dropList, item: string) {
    click(dropList);
    click(item);
}

export function selectFromDropListByText(droplist, item: string) {
    click(droplist);
    clickByText(button, item);
}

export function selectFormItems(fieldId: string, item: string): void {
    cy.get(fieldId).click();
    cy.contains("button", item).click();
}

export function selectReactFormItems(
    locator: string,
    item: string,
    formId?: string,
    fieldId?: string
): void {
    if (!formId) {
        formId = "FormGroup";
    }
    if (!fieldId) {
        fieldId = "fieldId";
    }
    cy.waitForReact();
    cy.react(formId, { props: { fieldId: locator } }).click();
    cy.contains("button", item).click();
}

export function checkSuccessAlert(fieldId: string, message: string, close = false): void {
    validateTextPresence(fieldId, message);
    if (close) {
        closeSuccessAlert();
    }
}

export function validateTextPresence(fieldId: string, message: string): void {
    cy.get(fieldId, { timeout: 150 * SEC }).should("contain.text", message);
}

export function closeSuccessAlert(): void {
    cy.get(closeSuccessNotification, { timeout: 10 * SEC })
        .first()
        .click({ force: true });
}

export function removeMember(memberName: string): void {
    cy.get("span").contains(memberName).siblings(commonView.removeButton).click();
}

export function exists(value: string, tableSelector = commonView.appTable): void {
    // Wait for DOM to render table and sibling elements
    cy.get(tableSelector, { timeout: 5 * SEC }).then(($tbody) => {
        if ($tbody.text() !== "No data available") {
            selectItemsPerPage(100);
            cy.get(tableSelector, { timeout: 5 * SEC }).should("contain", value);
        }
    });
}

export function notExists(value: string, tableSelector = commonView.appTable): void {
    cy.get(tableSelector).then(($tbody) => {
        if ($tbody.text() !== "No data available") {
            selectItemsPerPage(100);
            cy.get(tableSelector, { timeout: 5 * SEC }).should("not.contain", value);
        }
    });
}

export function selectFilter(filterName: string, identifiedRisk?: boolean, value = 0): void {
    cy.get(commonView.selectFilter)
        .eq(value)
        .within(() => {
            cy.get("div.pf-c-dropdown").click();
            cy.get("ul.pf-c-dropdown__menu").within(() => {
                clickByText("a", filterName);
            });
        });
}

export function filterInputText(searchTextValue: string, value: number): void {
    cy.get(commonView.filterInput).eq(value).click().focused().clear();
    cy.wait(200);
    cy.get(commonView.filterInput).eq(value).clear().type(searchTextValue);
    cy.get(commonView.searchButton).eq(value).click({ force: true });
}

export function clearAllFilters(): void {
    cy.contains(button, "Clear all filters").click({ force: true });
}

export function applySelectFilter(filterId, filterName, filterText, isValid = true): void {
    selectFilter(filterName);
    click("#" + filterId + "-filter-value-select");
    inputText("input.pf-c-form-control.pf-m-search", filterText);
    if (isValid) {
        clickByText("span.pf-c-check__label", filterText);
    } else {
        cy.contains("div.pf-c-select__menu", "No results found");
    }
    click("#" + filterId + "-filter-value-select");
}

export function applySearchFilter(
    filterName: string,
    searchText: any,
    identifiedRisk?: boolean,
    value?: number
): void {
    selectFilter(filterName, identifiedRisk, value);
    if (
        filterName == businessService ||
        filterName == tag ||
        filterName == credentialType ||
        filterName == artifact ||
        filterName == repositoryType ||
        filterName == owner
    ) {
        cy.get("div.pf-c-toolbar__group.pf-m-toggle-group.pf-m-filter-group.pf-m-show")
            .find("div.pf-c-select")
            .click();
        if (
            filterName == businessService ||
            filterName == repositoryType ||
            filterName == artifact ||
            filterName == owner
        ) {
            // ul[role=listbox] > li is for the Application Inventory page.
            // span.pf-c-check__label is for the Copy assessment page.
            cy.get("ul[role=listbox] > li, span.pf-c-check__label").contains(searchText).click();
        }
        if (filterName == tag || filterName == credentialType) {
            if (Array.isArray(searchText)) {
                searchText.forEach(function (searchTextValue) {
                    cy.get("div.pf-c-select__menu > fieldset > label > span")
                        .contains(searchTextValue)
                        .click();
                });
            } else {
                cy.get("div.pf-c-select__menu").contains(searchText).click();
            }
        }
    } else {
        if (Array.isArray(searchText)) {
            searchText.forEach(function (searchTextValue) {
                if (identifiedRisk) {
                    filterInputText(searchTextValue, 1);
                } else {
                    filterInputText(searchTextValue, 0);
                }
            });
        } else {
            if (identifiedRisk) {
                filterInputText(searchText, 1);
            } else {
                filterInputText(searchText, 0);
            }
        }
    }
    cy.wait(4000);
}

export function clickOnSortButton(
    fieldName: string,
    sortCriteria: string,
    tableSelector: string = commonView.commonTable
): void {
    cy.get(tableSelector)
        .contains("th", fieldName)
        .then(($tableHeader) => {
            const sortButton = $tableHeader.find("button");
            if (
                $tableHeader.attr("aria-sort") === "none" ||
                $tableHeader.attr("aria-sort") != sortCriteria
            ) {
                sortButton.trigger("click");
            }
            cy.wrap($tableHeader).should("have.attr", "aria-sort", sortCriteria);
        });
}

export function generateRandomDateRange(
    minDate?: Date,
    maxDate?: Date
): { start: Date; end: Date } {
    if (!minDate) minDate = new Date();

    // If maxDate is not provided, use one year from now
    if (!maxDate) {
        maxDate = new Date(minDate.getTime());
        maxDate.setFullYear(maxDate.getFullYear() + 1);
    }

    const dateRangeInMs = maxDate.getTime() - minDate.getTime();

    if (dateRangeInMs <= 0) {
        throw new Error("Invalid date range");
    }

    // Calculate start date and end date
    const startOffset = Math.random() * dateRangeInMs;
    const startDate = new Date(minDate.getTime() + startOffset);

    const endOffset = Math.random() * (dateRangeInMs - startOffset);
    const endDate = new Date(startDate.getTime() + endOffset);

    return {
        start: startDate,
        end: endDate,
    };
}

export function sortAscCopyAssessmentTable(sortCriteria: string): void {
    cy.get(`.pf-m-compact > thead > tr > th[data-label="${sortCriteria}"]`).then(($tableHeader) => {
        if (
            $tableHeader.attr("aria-sort") === "descending" ||
            $tableHeader.attr("aria-sort") === "none"
        ) {
            $tableHeader.find("button").trigger("click");
        }
    });
}

export function sortDescCopyAssessmentTable(sortCriteria: string): void {
    cy.get(`.pf-m-compact > thead > tr > th[data-label="${sortCriteria}"]`).then(($tableHeader) => {
        if (
            $tableHeader.attr("aria-sort") === "ascending" ||
            $tableHeader.attr("aria-sort") === "none"
        ) {
            $tableHeader.find("button").trigger("click");
        }
    });
}

export function getColumnDataforCopyAssessmentTable(columnName: string): Array<string> {
    selectItemsPerPage(100);
    cy.wait(4000);
    let itemList = [];
    cy.get(".pf-m-compact > tbody > tr")
        .not(".pf-c-table__expandable-row")
        .find(`td[data-label="${columnName}"]`)
        .each(($ele) => {
            if ($ele.text() !== "") itemList.push($ele.text().toString().toLowerCase());
        });
    return itemList;
}

export function getTableColumnData(columnName: string): Array<string> {
    selectItemsPerPage(100);
    let itemList = [];
    cy.get(".pf-c-table > tbody > tr", { timeout: 5 * SEC })
        .not(".pf-c-table__expandable-row")
        .find(`td[data-label="${columnName}"]`)
        .each(($ele) => {
            if (
                columnName === groupCount ||
                columnName === memberCount ||
                columnName === tagCount ||
                columnName === rank ||
                columnName === criticality ||
                columnName === priority ||
                columnName === confidence
            ) {
                if ($ele.text() !== "") itemList.push(Number($ele.text()));
            } else if (columnName === date) {
                if ($ele.text() !== "") itemList.push(new Date($ele.text().toString()).getTime());
            } else {
                if ($ele.text() !== "") itemList.push($ele.text().toString().toLowerCase());
            }
        });
    return itemList;
}

export function verifySortAsc(listToVerify: Array<any>, unsortedList: Array<any>): void {
    cy.wrap(listToVerify).then((capturedList) => {
        let sortedList = unsortedList.sort((a, b) =>
            a.toString().localeCompare(b, "en-us", {
                ignorePunctuation: true,
                numeric: !unsortedList.some(isNaN),
            })
        );
        expect(capturedList).to.be.deep.equal(sortedList);
    });
}

export function verifySortDesc(listToVerify: Array<any>, unsortedList: Array<any>): void {
    cy.wrap(listToVerify).then((capturedList) => {
        let reverseSortedList = unsortedList.sort((a, b) =>
            b.toString().localeCompare(a, "en-us", {
                ignorePunctuation: true,
                numeric: !unsortedList.some(isNaN),
            })
        );
        expect(capturedList).to.be.deep.equal(reverseSortedList);
    });
}

export function verifyDateSortAsc(listToVerify: string[], unsortedList: string[]): void {
    cy.wrap(listToVerify).then((capturedList) => {
        const sortedList = unsortedList
            .map((dateStr) => {
                // Parse the date and store the date object and original string together
                return {
                    date: new Date(Date.parse(dateStr)),
                    originalString: dateStr,
                };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime()) // sort the dates
            .map((item) => {
                return item.originalString;
            });

        expect(capturedList).to.be.deep.equal(sortedList);
    });
}

export function verifyDateSortDesc(listToVerify: string[], unsortedList: string[]): void {
    cy.wrap(listToVerify).then((capturedList) => {
        const sortedList = unsortedList
            .map((dateStr) => {
                // Parse the date and store the date object and original string together
                return {
                    date: new Date(Date.parse(dateStr)),
                    originalString: dateStr,
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime()) // sort the dates
            .map((item) => {
                return item.originalString;
            });

        expect(capturedList).to.be.deep.equal(sortedList);
    });
}

export function expandRowDetails(rowIdentifier: string): void {
    // displays row details by clicking on the expand button
    cy.get(tdTag)
        .contains(rowIdentifier)
        .closest(trTag)
        .within(() => {
            cy.get(commonView.expandRow).then(($btn) => {
                if ($btn.attr("aria-expanded") === "false") {
                    $btn.trigger("click");
                }
            });
        });
}

export function closeRowDetails(rowIdentifier: string): void {
    // closes row details by clicking on the collapse button
    cy.get(tdTag)
        .contains(rowIdentifier)
        .parent(trTag)
        .within(() => {
            if (!button["aria-label=Details"]) {
                return;
            }
            cy.get(commonView.expandRow).then(($btn) => {
                if ($btn.attr("aria-expanded") === "true") {
                    $btn.trigger("click");
                }
            });
        });
}

export function existsWithinRow(
    rowIdentifier: string,
    fieldId: string,
    valueToSearch: string
): void {
    // Verifies if the valueToSearch exists within the row
    cy.get(tdTag)
        .contains(rowIdentifier)
        .parent(trTag)
        .next()
        .find(fieldId)
        .should("contain", valueToSearch);
}

export function notExistsWithinRow(
    rowIdentifier: string,
    fieldId: string,
    valueToSearch: string
): void {
    // Verifies if the valueToSearch does not exists within the row
    cy.get(tdTag)
        .contains(rowIdentifier)
        .parent(trTag)
        .next()
        .find(fieldId)
        .should("not.contain", valueToSearch);
}

export function deleteTableRows(tableSelector = commonView.appTable): void {
    cy.get(tableSelector).get("tbody").find(trTag).as("rowsIdentifier");
    cy.get("@rowsIdentifier").then(($tableRows) => {
        for (let i = 0; i < $tableRows.length; i++) {
            cy.get("@rowsIdentifier")
                .eq(0)
                .within(() => {
                    click(commonView.deleteButton);
                });
            cy.get(commonView.confirmButton).click();
            cy.wait(2 * SEC);
        }
    });
}

export function importApplication(fileName: string, disableAutoCreation?: boolean): void {
    // Performs application import via csv file upload
    application_inventory_kebab_menu("Import");
    cy.get('input[type="file"]', { timeout: 2 * SEC }).attachFile(fileName, {
        subjectType: "drag-n-drop",
    });

    //Uncheck createEntitiesCheckbox if auto creation of entities is disabled
    if (disableAutoCreation)
        cy.get(createEntitiesCheckbox)
            .invoke("attr", "enabled")
            .then((enabled) => {
                enabled ? cy.log("Button is disabled") : cy.get(createEntitiesCheckbox).uncheck();
            });

    cy.get("form.pf-c-form", { timeout: 5 * SEC })
        .find("button")
        .contains("Import")
        .trigger("click");
    checkSuccessAlert(commonView.successAlertMessage, `Success! file saved to be processed.`);
    // unresolved bug https://issues.redhat.com/browse/TACKLE-927
}

export function uploadXml(fileName: string, customSelector?: string): void {
    let selector = 'input[type="file"]';
    if (customSelector) {
        selector = customSelector;
    }
    // Uplaod any file
    cy.get(selector, { timeout: 5 * SEC }).attachFile(
        { filePath: fileName, mimeType: "text/xml", encoding: "utf-8" },
        { subjectType: "drag-n-drop" }
    );
    cy.wait(2000);
}

export function uploadApplications(fileName: string): void {
    // Uplaod any file
    cy.get('input[type="file"]', { timeout: 5 * SEC }).attachFile(
        { filePath: fileName, encoding: "binary" },
        { subjectType: "drag-n-drop" }
    );
    cy.wait(2000);
}

export function uploadFile(fileName: string): void {
    // Uplaod any file
    cy.get('input[type="file"]', { timeout: 5 * SEC }).attachFile(fileName, {
        subjectType: "drag-n-drop",
    });
    cy.wait(2000);
}

export function navigate_to_application_inventory(tab?): void {
    cy.get("h1", { timeout: 5 * SEC }).then(($header) => {
        if (!$header.text().includes("Application inventory")) {
            selectUserPerspective("Migration");
            clickByText(navMenu, applicationInventory);
        }
    });
    if (tab == "Analysis") clickByText(navTab, analysis);
}

export function application_inventory_kebab_menu(menu, tab?): void {
    // The value for menu could be one of {Import, Manage imports, Delete, Manage credentials}
    if (tab == "Analysis") navigate_to_application_inventory("Analysis");
    else navigate_to_application_inventory();

    cy.get(actionButton).eq(1).click({ force: true });
    if (menu == "Import") {
        clickByText(button, "Import");
    } else {
        cy.get("a")
            .contains(menu)
            .then(($menu_item) => {
                if (!$menu_item.hasClass("pf-m-disabled")) {
                    clickByText("a", menu);
                    if (menu == "Delete") clickByText(button, menu, true);
                } else {
                    // close menu if nothing to do
                    cy.get(actionButton).eq(1).click({ force: true });
                }
            });
    }
}

export function openManageImportsPage(): void {
    // Opens the manage import applications page
    application_inventory_kebab_menu("Manage imports");
    cy.wait(5 * SEC)
        .get("h1", { timeout: 5 * SEC })
        .contains("Application imports");
}

export function openErrorReport(): void {
    // Open error report for the first row
    cy.get("table > tbody > tr").eq(0).as("firstRow");
    cy.get("@firstRow").find(actionButton).click();
    cy.get("@firstRow").find(button).contains("View error report").click();
    cy.get("h1", { timeout: 5 * SEC }).contains("Error report");
}

export function verifyAppImport(
    fileName: string,
    status: string,
    accepted: number,
    rejected: number
): void {
    // Verify the app import features for a single row
    cy.get("table > tbody > tr").eq(0).as("firstRow");
    cy.get("@firstRow").find("td[data-label='File name']").should("contain", fileName);
    cy.get("@firstRow").find("td[data-label='Status']").find("div").should("contain", status);
    cy.get("@firstRow").find("td[data-label='column-4']").should("contain", accepted);
    cy.get("@firstRow").find("td[data-label='column-5']").should("contain", rejected);
}

export function verifyImportErrorMsg(errorMsg: any): void {
    // Verifies if the error message appears in the error report table
    if (Array.isArray(errorMsg)) {
        errorMsg.forEach(function (message) {
            cy.get("table > tbody > tr > td").should("contain", message);
        });
    } else {
        cy.get("table > tbody > tr > td").should("contain", errorMsg);
    }
}

export function migration_wave_kebab_menu(menu): void {
    // The value for menu could be one of {Export to Issue Manager, Delete}
    cy.get(actionButton).eq(1).click({ force: true });
    cy.get(commonView.kebabMenuItem).contains(menu).click({ force: true });
}

export function deleteAllMigrationWaves(currentPage = false): void {
    MigrationWave.open();
    cy.wait(2000);
    cy.get(MigrationWaveView.waveTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.wait(1000);
                cy.get("span.pf-c-options-menu__toggle-text")
                    .eq(0)
                    .then(($body) => {
                        if (!$body.text().includes("of 0")) {
                            if (currentPage) {
                                cy.get(".pf-c-dropdown__toggle-button").click({ force: true });
                                clickByText(button, "Select page");
                            } else {
                                cy.get("input#bulk-selected-items-checkbox", {
                                    timeout: 10 * SEC,
                                }).check({ force: true });
                            }

                            migration_wave_kebab_menu("Delete");
                            clickByText(button, "Delete", true);
                        }
                    });
            }
        });
}

export function deleteApplicationTableRows(): void {
    // Delete all rows one by one for which Delete button is enabled
    // to be used only in manageImports tests as we don't know which apps
    // are imported. For all other tests use deleteByList(appList)
    navigate_to_application_inventory();
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        const name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .closest(trTag)
                            .within(() => {
                                click(actionButton);
                                cy.wait(800);
                            })
                            .contains(button, deleteAction)
                            .then(($delete_btn) => {
                                if (!$delete_btn.hasClass("pf-m-aria-disabled")) {
                                    $delete_btn.click();
                                    cy.wait(800);
                                    click(commonView.confirmButton);
                                    cy.wait(2000);
                                }
                            });
                    });
            }
        });
}

export function deleteAppImportsTableRows(lastPage = false): void {
    if (!lastPage) {
        openManageImportsPage();
        // Select 100 items per page
        selectItemsPerPage(100);
        cy.wait(2000);
    }

    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        var date = $tableRow.find("td[data-label=Date]").text();
                        cy.get(tdTag)
                            .contains(date)
                            .parent(trTag)
                            .within(() => {
                                click(actionButton);
                                cy.wait(800);
                            })
                            .contains(button, deleteAction)
                            .click();
                        cy.wait(800);
                        click(commonView.confirmButton);
                        cy.wait(4000);
                    });
            }
        });
}

// TODO: Delete calls to this method and then remove it
export function preservecookies(): void {}

// Checks if the hook has to be skipped, if the tag is not mentioned during test run
export function hasToBeSkipped(tagName: string): boolean {
    if (Cypress.env("grepTags")) {
        if (!Cypress.env("grepTags").includes(tagName)) return true;
    }
    return false;
}

// Perform edit/delete action on the specified row selector by clicking a text button
export function performRowAction(itemName: string, action: string): void {
    // itemName is text to be searched on the screen (like credentials name, stakeholder name, etc)
    // Action is the name of the action to be applied (usually edit or delete)

    cy.get(tdTag, { timeout: 120 * SEC })
        .contains(itemName, { timeout: 120 * SEC })
        // .closest(tdTag)
        .closest(trTag)
        .within(() => {
            clickByText(button, action);
            cy.wait(500);
            clickByText(button, action);
            cy.wait(500);
        });
}

// Perform edit/delete action on the specified row selector by clicking an icon button
/* As of Tackle 2.1, this function can be used to click the update button and kebab menu for
   applications on the Application Inventory page */
export function performRowActionByIcon(itemName: string, action: string): void {
    // itemName is the text to be searched on the screen (For eg: application name, etc)
    // Action is the name of the action to be applied (For eg: edit or click kebab menu)
    selectItemsPerPage(100);
    cy.contains(itemName, { timeout: 120 * SEC })
        .closest(trTag)
        .within(() => {
            click(action);
        });
}

export function createMultipleJiraConnections(
    numberOfJiras: number,
    jiraCredential: JiraCredentials,
    isInsecure = false,
    useTestingAccount = true
): Array<Jira> {
    let jiraList: Array<Jira> = [];
    let jiraCloudConnectionData: JiraConnectionData;
    while (jiraList.length < numberOfJiras) {
        jiraCloudConnectionData = getJiraConnectionData(
            jiraCredential,
            JiraType.cloud,
            isInsecure,
            useTestingAccount
        );
        jiraList.push(new Jira(jiraCloudConnectionData));
    }
    return jiraList;
}

export function createMultipleCredentials(numberOfCredentials: number): Array<Credentials> {
    let newCredentialsList: Array<Credentials> = [];
    let createdCredentialsList: Array<Credentials> = [];
    while (newCredentialsList.length < numberOfCredentials) {
        newCredentialsList.push(
            new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy))
        );
        newCredentialsList.push(
            new CredentialsMaven(getRandomCredentialsData(CredentialType.maven))
        );
        newCredentialsList.push(
            new CredentialsSourceControlUsername(
                getRandomCredentialsData(CredentialType.sourceControl)
            )
        );
        newCredentialsList.push(
            new CredentialsSourceControlKey(
                getRandomCredentialsData(
                    CredentialType.sourceControl,
                    UserCredentials.sourcePrivateKey
                )
            )
        );
        newCredentialsList.push(
            new JiraCredentials(getJiraCredentialData(CredentialType.jiraBasic, false))
        );
        newCredentialsList.push(
            new JiraCredentials(getJiraCredentialData(CredentialType.jiraToken, false))
        );
    }
    newCredentialsList.forEach((currentCredential) => {
        currentCredential.create();
        createdCredentialsList.push(currentCredential);
    });
    return createdCredentialsList;
}

export function createMultipleStakeholders(
    numberOfStakeholders: number,
    jobFunctionList?: Array<Jobfunctions>,
    stakeholderGroupsList?: Array<Stakeholdergroups>
): Array<Stakeholders> {
    let stakeholdersList: Array<Stakeholders> = [];
    for (let i = 0; i < numberOfStakeholders; i++) {
        let jobFunction: string;
        let stakeholderGroupNames: Array<string> = [];
        if (jobFunctionList) jobFunction = jobFunctionList[i].name;
        if (stakeholderGroupsList) stakeholderGroupNames.push(stakeholderGroupsList[i].name);
        // Create new stakeholder
        const stakeholder = new Stakeholders(
            data.getEmail(),
            data.getFullName(),
            jobFunction,
            stakeholderGroupNames
        );
        stakeholder.create();
        stakeholdersList.push(stakeholder);
    }
    return stakeholdersList;
}

export function createMultipleMigrationWaves(
    numberOfMigrationWaves: number,
    stakeholdersList?: Array<Stakeholders>,
    stakeholderGroupsList?: Array<Stakeholdergroups>
): Array<MigrationWave> {
    const migrationWaveList: Array<MigrationWave> = [];
    for (let i = 0; i < numberOfMigrationWaves; i++) {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        const end = new Date(now.getTime());
        end.setFullYear(end.getFullYear() + 1);
        // Create new migration wave
        const migrationWave = new MigrationWave(
            data.getAppName(),
            now,
            end,
            stakeholdersList,
            stakeholderGroupsList
        );
        migrationWave.create();
        migrationWaveList.push(migrationWave);
    }
    return migrationWaveList;
}

export function createMultipleJobFunctions(num): Array<Jobfunctions> {
    let jobFunctionsList: Array<Jobfunctions> = [];
    for (let i = 0; i < num; i++) {
        const jobFunction = new Jobfunctions(data.getFullName());
        jobFunction.create();
        jobFunctionsList.push(jobFunction);
    }
    return jobFunctionsList;
}

export function createMultipleStakeholderGroups(
    numberofstakeholdergroup: number,
    stakeholdersList?: Array<Stakeholders>
): Array<Stakeholdergroups> {
    let stakeholdergroupsList: Array<Stakeholdergroups> = [];
    for (let i = 0; i < numberofstakeholdergroup; i++) {
        let stakeholders: Array<string> = [];
        if (stakeholdersList) stakeholders.push(stakeholdersList[i].name);
        // Create new stakeholder group
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            stakeholders
        );
        stakeholdergroup.create();
        stakeholdergroupsList.push(stakeholdergroup);
    }
    return stakeholdergroupsList;
}

export function createMultipleBusinessServices(
    numberofbusinessservice: number,
    stakeholdersList?: Array<Stakeholders>
): Array<BusinessServices> {
    let businessservicesList: Array<BusinessServices> = [];
    for (let i = 0; i < numberofbusinessservice; i++) {
        let stakeholders: string;
        if (stakeholdersList) stakeholders = stakeholdersList[i].name;
        // Create new business service
        const businessservice = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholders
        );
        businessservice.create();
        businessservicesList.push(businessservice);
    }
    return businessservicesList;
}

export function createMultipleTags(numberoftags: number): Array<Tag> {
    let tagList: Array<Tag> = [];
    for (let i = 0; i < numberoftags; i++) {
        //Create Tag category
        const tagCategory = new TagCategory(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber()
        );
        tagCategory.create();

        // Create new tag
        const tag = new Tag(data.getRandomWord(6), tagCategory.name);
        tag.create();
        tagList.push(tag);
    }
    return tagList;
}

export function generateMultipleCredentials(amount: number): Credentials[] {
    cy.pause();
    let newCredentialsList = [];
    let createdCredentialsList = [];
    for (let i = 0; i < Math.ceil((10 - amount) / 4); i++) {
        newCredentialsList.push(
            new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy))
        );
        newCredentialsList.push(
            new CredentialsMaven(getRandomCredentialsData(CredentialType.maven))
        );
        newCredentialsList.push(
            new CredentialsSourceControlUsername(
                getRandomCredentialsData(CredentialType.sourceControl)
            )
        );
        newCredentialsList.push(
            new CredentialsSourceControlKey(getRandomCredentialsData(CredentialType.sourceControl))
        );
    }
    cy.pause();
    newCredentialsList.forEach((currentCredential) => {
        currentCredential.create();
        createdCredentialsList.push(currentCredential);
    });
    cy.pause();
    return createdCredentialsList;
}

export function getRowsAmount(): number {
    let amount: number;
    cy.get(commonView.appTable).get("tbody").find(trTag).as("rowsIdentifier");
    cy.get("@rowsIdentifier").then(($tableRows) => {
        amount = $tableRows.length;
    });
    return amount;
}

export function getRandomApplicationData(
    appName?,
    options?: { sourceData?; binaryData? },
    tags?
): applicationData {
    let name = data.getAppName();
    if (appName) {
        name = appName + "_" + data.getAppName();
    }

    let appdata = {
        name: name,
        description: data.getDescription(),
        comment: data.getDescription(),
    };

    if (options) {
        if (options.sourceData) {
            appdata["repoType"] = options.sourceData.repoType;
            appdata["sourceRepo"] = options.sourceData.sourceRepo;
            appdata["branch"] = options.sourceData.branch;
            appdata["rootPath"] = options.sourceData.rootPath;
        }
    }

    if (options) {
        if (options.binaryData) {
            appdata["group"] = options.binaryData.group;
            appdata["artifact"] = options.binaryData.artifact;
            appdata["version"] = options.binaryData.version;
            appdata["packaging"] = options.binaryData.packaging;
        }
    }

    if (tags) appdata["tags"] = tags;

    return appdata;
}

export function getRandomAnalysisData(analysisdata): analysisData {
    return {
        source: analysisdata.source,
        target: analysisdata.target,
        binary: analysisdata.binary,
        customRule: analysisdata.customRule,
        enableTransaction: analysisdata.enableTransaction,
        disableTagging: analysisdata.disableTagging,
        appName: analysisdata.appName,
        storyPoints: analysisdata.storyPoints,
        excludePackages: analysisdata.excludePackages,
        excludeRuleTags: analysisdata.excludeRuleTags,
        manuallyAnalyzePackages: analysisdata.manuallyAnalyzePackages,
        excludedPackagesList: analysisdata.excludedPackagesList,
        incidents: analysisdata.incidents,
        openSourceLibraries: analysisdata.openSourceLibraries,
    };
}

export function createMultipleApplications(numberofapplications: number): Array<Assessment> {
    let applicationList: Array<Assessment> = [];
    for (let i = 0; i < numberofapplications; i++) {
        // Navigate to application inventory tab and create new application
        const application = new Assessment(getRandomApplicationData());
        application.create();
        applicationList.push(application);
        cy.wait(2000);
    }
    return applicationList;
}

export function createMultipleApplicationsWithBSandTags(
    numberofapplications: number,
    businessservice?: Array<BusinessServices>,
    tagList?: Array<Tag>,
    stakeholder?: Array<Stakeholders>
): Array<Assessment> {
    let applicationList: Array<Assessment> = [];
    let tags: string[];
    let business = "";
    let owner = "";
    clickByText(navMenu, applicationInventory);
    for (let i = 0; i < numberofapplications; i++) {
        if (businessservice) business = businessservice[i].name;
        if (tagList) tags = [tagList[i].name];
        if (stakeholder) owner = stakeholder[i].name;
        let appdata = {
            name: data.getAppName(),
            business: business,
            description: data.getDescription(),
            tags: tags,
            comment: data.getDescription(),
            owner: owner,
        };
        const application = new Assessment(appdata);
        application.create();
        applicationList.push(application);
        cy.wait(2000);
    }
    return applicationList;
}

export function createApplicationObjects(numberOfObjects: number): Array<Assessment> {
    let applicationObjectsList: Array<Assessment> = [];
    for (let i = 0; i < numberOfObjects; i++) {
        // Create an object of application
        const application = new Assessment(getRandomApplicationData());
        applicationObjectsList.push(application);
    }
    return applicationObjectsList;
}

export function deleteAllJobfunctions(cancel = false): void {
    Jobfunctions.openList();
    deleteAllItems();
}

type Deletable = { delete: () => void };

export function deleteByList<T extends Deletable>(array: T[]): void {
    array.forEach((element) => {
        cy.wait(0.8 * SEC);
        element.delete();
    });
}

export function deleteAllStakeholders(): void {
    Stakeholders.openList();
    cy.get("table[aria-label='Stakeholders table']", { timeout: 2 * SEC }).then(($tbody) => {
        if (!$tbody.text().includes("No data available")) {
            selectItemsPerPage(100);
            cy.get(commonView.deleteButton).then(($elems) => {
                const elemsLength = $elems.length;
                for (let i = 0; i < elemsLength; i++) {
                    cy.get(commonView.deleteButton)
                        .first()
                        .click()
                        .then((_) => {
                            cy.wait(0.5 * SEC);
                            click(commonView.confirmButton);
                            cy.wait(SEC);
                        });
                }
            });
        }
    });
}

export function deleteAllStakeholderGroups(cancel = false): void {
    Stakeholdergroups.openList();
    deleteAllItems();
}

export function deleteAllBusinessServices() {
    BusinessServices.openList();
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        const name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .closest(trTag)
                            .contains(button, deleteAction)
                            .then(($delete_btn) => {
                                if (!$delete_btn.hasClass("pf-m-aria-disabled")) {
                                    $delete_btn.click();
                                    cy.wait(800);
                                    click(commonView.confirmButton);
                                    cy.wait(2000);
                                }
                            });
                    });
            }
        });
}

export function deleteAllTagCategory(cancel = false): void {
    TagCategory.openList();
    cy.get(commonView.appTable, { timeout: 2 * SEC })
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        cy.wait(1000);
                        let name = $tableRow.find('td[data-label="Tag type"]').text();
                        if (!(data.getDefaultTagCategories().indexOf(name) > -1)) {
                            cy.get(tdTag)
                                .contains(name)
                                .parent(trTag)
                                .within(() => {
                                    click(commonView.deleteButton);
                                    cy.wait(1000);
                                });
                            click(commonView.confirmButton);
                            cy.wait(4000);
                        }
                    });
            }
        });
}

export function deleteAllTagsAndTagCategories(): void {
    const nonDefaultTagTypes = [];
    TagCategory.openList();

    cy.get(commonView.appTable, { timeout: 2 * SEC })
        .find(trTag)
        .not(commonView.expandableRow)
        .each(($rowGroup) => {
            let typeName = $rowGroup.find(tagLabels.type).text();
            let isDefault = false;
            for (let currentType of data.getDefaultTagCategories()) {
                if (currentType == typeName) {
                    isDefault = true;
                    break; // Exiting from cycle if current tag category belongs to default
                }
            }
            if (!isDefault && typeName !== "") {
                if ($rowGroup.find(tagLabels.count).text() != "0") {
                    nonDefaultTagTypes.push(typeName);
                    expandRowDetails(typeName);
                } else {
                    let currentTagType = new TagCategory(typeName, data.getColor());
                    currentTagType.delete();
                }
            }
        })
        .then(() => {
            if (nonDefaultTagTypes.length > 0) {
                for (let currentType of nonDefaultTagTypes) {
                    let tagList = [];
                    cy.contains(tdTag, currentType)
                        .closest("tbody")
                        .within(() => {
                            cy.get(tagLabels.name).each(($tagRow) => {
                                let tagName = $tagRow.text();
                                tagList.push(new Tag(tagName, currentType));
                            });
                        })
                        .then(() => {
                            tagList.forEach((currentTag) => {
                                currentTag.delete();
                                tagList = deleteFromArray(tagList, currentTag);
                            });
                        });
                    let currentTagType = new TagCategory(currentType, data.getColor());
                    currentTagType.delete();
                }
            }
        });
}

export async function deleteAllCredentials() {
    Credentials.openList();
    deleteAllItems();
}

export function deleteAllItems(amountPerPage = 100, pageNumber?: number) {
    selectItemsPerPage(amountPerPage);
    if (pageNumber) {
        goToPage(pageNumber);
    }
    cy.get(commonView.appTable, { timeout: 15 * SEC })
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        let name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .closest(trTag)
                            .within(() => {
                                click(commonView.deleteButton);
                                cy.wait(SEC);
                            });
                        click(commonView.confirmButton);
                        cy.wait(SEC);
                    });
            }
        });
}

export const deleteFromArray = <T>(array: T[], el: T): T[] => {
    return array.filter((item) => item !== el);
};

export const deleteFromArrayByIndex = <T>(array: T[], index: number): T[] => {
    return array.filter((_, i) => i !== index);
};

export function goToPage(page: number): void {
    cy.get(divHeader)
        .eq(0)
        .within(() => {
            cy.get(firstPageButton).then(($firstPageButton) => {
                cy.get(lastPageButton).then(($lastPageButton) => {
                    if (
                        !$firstPageButton.hasClass(".pf-m-disabled") ||
                        !$lastPageButton.hasClass(".pf-m-disabled")
                    ) {
                        cy.get(pageNumInput, { timeout: 2 * SEC })
                            .clear()
                            .type(page.toString())
                            .type("{enter}");
                    }
                });
            });
        });
}

export function selectUserPerspective(userType: string): void {
    cy.get(commonView.optionMenu, { timeout: 100 * SEC })
        .eq(0)
        .click()
        .then(($a) => {
            if (userType == "Migration" && $a.find('ul[title="Admin"]').length) {
                clickByText(commonView.userPerspectiveMenu, "Administration");
                $a.trigger("click");
            }
            clickByText(commonView.userPerspectiveMenu, userType);
        });
}

export function selectWithinModal(selector: string): void {
    clickWithin(modal, selector);
}

/**
 * Executes a function inside a specified HTML element
 * @param selector parent element
 * @param functionToExec function to execute
 * @param index selector index
 */
export function callWithin(selector: string, functionToExec: () => void, index = 0): void {
    cy.get(selector)
        .eq(index)
        .within(() => functionToExec());
}

export function clickWithin(parent, selector: string, isForced = false, log = false): void {
    cy.get(parent, { timeout: 30 * SEC })
        .eq(0)
        .within(() => {
            click(selector, isForced, log);
        });
}

//function to select checkboxes
export function selectCheckBox(selector: string, isForced = false, log = false): void {
    cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
        if (!$checkbox.prop("checked")) {
            click(selector, isForced, log);
        }
    });
}

//function to unselect checkboxes
export function unSelectCheckBox(selector: string, isForced = false, log = false): void {
    cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
        if ($checkbox.prop("checked")) {
            click(selector, isForced, log);
        }
    });
}

export function applyAction(itemName, action: string): void {
    cy.contains(tdTag, itemName)
        .closest(trTag)
        .within(() => {
            click('button[aria-label="Actions"]');
            clickByText(button, action);
        });
}

export function confirm(): void {
    click(confirmButton);
}

export function validatePagination(): void {
    // Verify next buttons are enabled as there are more than 11 rows present
    cy.get(nextPageButton, { timeout: 10 * SEC }).each(($nextBtn) => {
        cy.wrap($nextBtn).should("not.be.disabled");
    });

    // Verify that previous buttons are disabled being on the first page
    cy.get(prevPageButton).each(($previousBtn) => {
        cy.wrap($previousBtn).should("be.disabled");
    });

    // Verify that navigation button to last page is enabled
    cy.get(lastPageButton).should("not.be.disabled");

    // Verify that navigation button to first page is disabled being on the first page
    cy.get(firstPageButton).should("be.disabled");

    // Navigate to next page
    cy.get(nextPageButton).eq(0).click();

    // Verify that previous buttons are enabled after moving to next page
    cy.get(prevPageButton).each(($previousBtn) => {
        cy.wrap($previousBtn).should("not.be.disabled");
    });

    // Verify that navigation button to first page is enabled after moving to next page
    cy.get(firstPageButton).should("not.be.disabled");

    // Moving back to the first page
    cy.get(firstPageButton).eq(0).click();
}

export function goToLastPage(): void {
    cy.get(lastPageButton, { timeout: 10 * SEC })
        .eq(0)
        .then(($button) => {
            if (!$button.hasClass(".pf-m-disabled")) {
                clickWithin(divHeader, lastPageButton);
            }
        });
}

export function validateValue(selector, value: string): void {
    if (!value || value === "") {
        cy.log("Value is not defined");
    } else {
        cy.get(selector)
            .invoke("val")
            .then(($input) => {
                expect($input).eq(value);
            });
    }
}

export function writeMavenSettingsFile(username: string, password: string, url?: string): void {
    cy.readFile("cypress/fixtures/xml/settings.xml").then((data) => {
        // Sometimes the data will be undefined due to access problems in pipelines
        // When no access, data will be strictly undefined, not an empty string
        if (data === undefined) {
            cy.writeFile("cypress/fixtures/xml/settings.xml", "");
            return;
        }
        var xml = data.toString();
        const parser = new DOMParser();
        const xmlDOM = parser.parseFromString(xml, "text/xml");
        xmlDOM.getElementsByTagName("username")[0].childNodes[0].nodeValue = username;
        xmlDOM.getElementsByTagName("password")[0].childNodes[0].nodeValue = password;
        if (url) {
            xmlDOM
                .getElementsByTagName("repository")[1]
                .getElementsByTagName("url")[0].childNodes[0].nodeValue = url;
        }
        var serializer = new XMLSerializer();
        var writetofile = serializer.serializeToString(xmlDOM);
        cy.writeFile("cypress/fixtures/xml/settings.xml", writetofile);
    });
}

export function writeGpgKey(git_key): void {
    cy.readFile("cypress/fixtures/gpgkey").then((data) => {
        var key = git_key;
        var beginningKey: string = "-----BEGIN RSA PRIVATE KEY-----";
        var endingKey: string = "-----END RSA PRIVATE KEY-----";
        var keystring = key.toString().split(" ").join("\n");
        var gpgkey = beginningKey + "\n" + keystring + "\n" + endingKey;
        cy.writeFile("cypress/fixtures/gpgkey", gpgkey);
    });
}

export function doesExistSelector(selector: string, isAccessible: boolean): void {
    if (isAccessible) {
        cy.get(selector).should("exist");
    } else {
        cy.get(selector).should("not.exist");
    }
}

export function doesExistText(str: string, toBePresent: boolean): void {
    if (toBePresent) {
        cy.contains(str, { timeout: 120 * SEC }).should("exist");
    } else {
        cy.contains(str).should("not.exist");
    }
}

export function enableSwitch(selector: string): void {
    cy.get(selector)
        .parent("label")
        .within(() => {
            cy.get(".pf-m-on")
                .invoke("css", "display")
                .then((display) => {
                    if (display.toString() == "none") {
                        click(switchToggle);
                    }
                });
        });
}

export function disableSwitch(selector: string): void {
    cy.get(selector)
        .parent("label")
        .within(() => {
            cy.get(".pf-m-off")
                .invoke("css", "display")
                .then((display) => {
                    if (display.toString() == "none") {
                        click(switchToggle);
                    }
                });
        });
}

export function validateTooShortInput(selector, anotherSelector?: string, message?: string): void {
    inputText(selector, "ab");
    if (anotherSelector) click(anotherSelector);
    const validationMessage = message || "This field must contain at least 3 characters.";
    doesExistText(validationMessage, true);
}

export function validateTooLongInput(
    selector: string,
    length = 121,
    anotherSelector?: string,
    message?: string
): void {
    inputText(selector, randomWordGenerator(length));
    if (anotherSelector) click(anotherSelector);
    const validationMessage = message || "This field must contain fewer than";
    doesExistText(validationMessage, true);
}

// This method accepts enums or maps and returns list of keys, so you can iterate by keys
export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

export function isRwxEnabled(): boolean {
    return Cypress.env("rwx_enabled");
}

// This method is patching
export function configureRWX(isEnabled = true): void {
    // Patching CR to set value
    cy.url().then(($url) => {
        const pattern = /-(.*?)\./;
        let namespace: string;
        const match = $url.match(pattern);
        let value: string;
        if (isEnabled) {
            value = "true";
        } else {
            value = "false";
        }
        let command = "";
        if (match && match[1]) {
            namespace = match[1].toString();
        } else {
            namespace = "konveyor-tackle";
        }
        let tackleCr = `tackle=$(oc get tackle -n${namespace}|grep -iv name|awk '{print $1}'); `;
        command += tackleCr;
        command += "oc patch tackle ";
        command += "$tackle ";
        command += `-n${namespace} `;
        command += "--type merge ";
        command += `--patch '{"spec":{"rwx_supported": ${value}}}'`;
        cy.log(command);
        cy.pause();
        cy.exec(command).then((result) => {
            cy.log(result.stderr);
        });
        // Timeout as it takes time until pods are starting to reboot
        cy.wait(180 * SEC);
        cy.reload();
    });
}

export function isEnabled(selector: string, toBeEnabled?: boolean): void {
    if (toBeEnabled) {
        cy.get(selector).should("not.have.class", "pf-m-aria-disabled");
    } else {
        cy.get(selector).should("have.class", "pf-m-aria-disabled");
    }
}

export function isButtonEnabled(selector: string, toBeEnabled?: boolean): void {
    if (toBeEnabled) {
        cy.get(selector).should("be.enabled");
    } else {
        cy.get(selector).should("not.be.enabled");
    }
}

export function clickTab(name: string): void {
    clickByText(navTab, name);
}

export function cleanupDownloads(): void {
    // This will eliminate content of `cypress/downloads` folder
    cy.exec("cd cypress/downloads; rm -rf ./*").then((result) => {
        cy.log(result.stdout);
    });
}

export function selectAssessmentApplications(apps: string): void {
    clickWithin(modal, "button[aria-label='Select']");
    clickByText(button, `Select ${apps}`, false, true);
    clickWithin(modal, "button[aria-label='Select']", false, true);
    cy.get("div").then(($div) => {
        if ($div.text().includes("in-progress or complete assessment")) {
            selectCheckBox("#confirm-copy-checkbox");
        }
    });
}

export function closeModalWindow(): void {
    click(closeModal, false, true);
}
