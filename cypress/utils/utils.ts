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
import { Jobfunctions } from "../e2e/models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../e2e/models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../e2e/models/migration/controls/stakeholders";
import { TagCategory } from "../e2e/models/migration/controls/tagcategory";
import { Tag } from "../e2e/models/migration/controls/tags";

import * as ansiRegex from "ansi-regex";
import "cypress-file-upload";
import { Credentials } from "../e2e/models/administration/credentials/credentials";
import { CredentialsMaven } from "../e2e/models/administration/credentials/credentialsMaven";
import { CredentialsProxy } from "../e2e/models/administration/credentials/credentialsProxy";
import { CredentialsSourceControlKey } from "../e2e/models/administration/credentials/credentialsSourceControlKey";
import { CredentialsSourceControlUsername } from "../e2e/models/administration/credentials/credentialsSourceControlUsername";
import { JiraCredentials } from "../e2e/models/administration/credentials/JiraCredentials";
import { Jira } from "../e2e/models/administration/jira-connection/jira";
import { Application } from "../e2e/models/migration/applicationinventory/application";
import { Archetype } from "../e2e/models/migration/archetypes/archetype";
import { MigrationWave } from "../e2e/models/migration/migration-waves/migration-wave";
import {
    applicationInventory,
    button,
    confidence,
    CredentialType,
    criticality,
    groupCount,
    issueFilter,
    JiraType,
    memberCount,
    migration,
    priority,
    rank,
    save,
    SEC,
    SortType,
    tagCount,
    TaskKind,
    TaskStatus,
    tdTag,
    trTag,
    UserCredentials,
} from "../e2e/types/constants";
import { analysisData, AppIssue, applicationData, JiraConnectionData } from "../e2e/types/types";
import {
    codeEditorControls,
    manageCredentials,
    mavenCredential,
    menuList,
    menuToggle,
    sourceCredential,
} from "../e2e/views/analysis.view";
import {
    appImportForm,
    applicationsActionButton,
    createEntitiesCheckbox,
    date,
    kebabMenu,
    manageColumnsModal,
    sideKebabMenu,
} from "../e2e/views/applicationinventory.view";
import { closeModal } from "../e2e/views/assessment.view";
import {
    aboutButton,
    actionMenuItem,
    appTable,
    cancelButton,
    closeAbout,
    closeSuccessNotification,
    commonTable,
    confirmButton,
    deleteButton,
    divHeader,
    downloadFormatDetails,
    downloadTaskButton,
    expandableRow,
    expandRow,
    filterDropDownContainer,
    filteredBy,
    filterInput,
    firstPageButton,
    itemsPerPageMenuOptions,
    itemsPerPageToggleButton,
    lastPageButton,
    liTag,
    manageImportsActionsButton,
    modal,
    nextPageButton,
    optionMenu,
    pageNumInput,
    prevPageButton,
    removeButton,
    searchButton,
    sideDrawer,
    span,
    standardFilter,
    submitButton,
    successAlertMessage,
    taskDetailsEditor,
} from "../e2e/views/common.view";
import { filterSelectType } from "../e2e/views/credentials.view";
import {
    bsFilterName,
    searchInput,
    searchMenuToggle,
    singleApplicationColumns,
    tagFilterName,
} from "../e2e/views/issue.view";
import * as loginView from "../e2e/views/login.view";
import { navMenu, navTab } from "../e2e/views/menu.view";
import { MigrationWaveView } from "../e2e/views/migration-wave.view";
import { switchToggle } from "../e2e/views/reportsTab.view";
import { stakeHoldersTable } from "../e2e/views/stakeholders.view";
import { tagLabels, tagMenuButton } from "../e2e/views/tags.view";
import * as data from "../utils/data_utils";
import {
    getJiraConnectionData,
    getJiraCredentialData,
    getRandomCredentialsData,
    randomWordGenerator,
} from "./data_utils";
import Chainable = Cypress.Chainable;

const { _ } = Cypress;

export function inputText(fieldId: string, text: any, log = false): void {
    if (!log) {
        cy.log(`Type ${text} in ${fieldId}`);
    }
    cy.get(fieldId, { log, timeout: 30 * SEC })
        .click({ log })
        .focused({ log })
        .clear({ log });
    cy.wait(200, { log });
    cy.get(fieldId, { log, timeout: 30 * SEC })
        .clear({ log })
        .type(text, { log });
}

export function clearInput(fieldID: string): void {
    cy.get(fieldID).clear();
}

export function clickByText(
    fieldId: string,
    buttonText: string | ansiRegex,
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

export function click(fieldId: string, isForced = true, log = false, number = 0): void {
    if (!log) {
        cy.log(`Click ${fieldId}`);
    }
    cy.get(fieldId, { log, timeout: 30 * SEC })
        .eq(number)
        .click({ log, force: isForced });
}

export function clickWithFocus(fieldId: string, isForced = true, log = false, number = 0): void {
    if (!log) {
        cy.log(`Click ${fieldId}`);
    }
    cy.get(fieldId, { log, timeout: 30 * SEC })
        .eq(number)
        .focus()
        .click({ log, force: isForced });
}

export function clickJs(fieldId: string, isForced = true, log = false, number = 0): void {
    if (!log) {
        cy.log(`Click ${fieldId}`);
    }
    cy.get(fieldId, { log, timeout: 30 * SEC })
        .eq(number)
        .then(($obj) => {
            $obj[0].click();
        });
}

export function submitForm(): void {
    cy.get(submitButton, { timeout: 10 * SEC }).should("not.be.disabled");
    clickJs(submitButton);
}

export function cancelForm(): void {
    clickJs(cancelButton);
}

export function login(username?: string, password?: string, firstLogin = false): Chainable<null> {
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
        cy.wait(5 * SEC);
        cy.get("h1", { timeout: 120 * SEC, log: false }).then(($title) => {
            // With auth disabled, login page is not displayed and users are taken straight
            // to the Application Inventory page.
            if (
                $title.text().toString().trim() !== "Sign in to your account" &&
                $title.text().includes("Application inventory")
            ) {
                return;
            }

            const userName = username ?? Cypress.env("user");
            const userPassword = password ?? Cypress.env("pass");
            cy.wait(3 * SEC);
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
    click("#logout");
    cy.get("h1", { timeout: 15 * SEC }).contains("Sign in to your account");
}

export function resetURL(): void {
    Application.open(true);
}

export function selectItemsPerPage(items: number): void {
    cy.log(`Select ${items} per page`);
    cy.get(itemsPerPageToggleButton, { timeout: 60 * SEC, log: false }).then(($toggleBtn) => {
        if (!$toggleBtn.eq(0).is(":disabled")) {
            $toggleBtn.eq(0).trigger("click");
            cy.get(itemsPerPageMenuOptions, { log: false });
            cy.get(`li[data-action="per-page-${items}"]`, { log: false })
                .contains(`${items}`)
                .click({
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

export function selectRow(name: string): void {
    // Clicks on a particular row on any table
    cy.get(tdTag, { timeout: 10 * SEC })
        .contains(name)
        .closest(trTag)
        .click();
}

export function sidedrawerTab(name: string, tab: string): void {
    selectRow(name);
    cy.get(sideDrawer.pageDrawerContent).within(() => {
        clickTab(tab);
    });
}

export function checkSuccessAlert(fieldId: string, message: string, close = false): void {
    validateTextPresence(fieldId, message);
    if (close) {
        closeSuccessAlert();
    }
}

export function validateTextPresence(fieldId: string, message: string, shouldBeFound = true): void {
    if (shouldBeFound) {
        cy.get(fieldId, { timeout: 150 * SEC }).should("contain.text", message);
    } else {
        cy.get(fieldId, { timeout: 150 * SEC }).should("not.contain.text", message);
    }
}

export function validateNumberPresence(fieldId: string, value: number): void {
    cy.get(fieldId)
        .invoke("text")
        .then((text) => {
            cy.wrap(parseFloat(text)).should("eq", value);
        });
}

export function validateAnyNumberPresence(fieldId: string): void {
    cy.get(fieldId)
        .invoke("text")
        .then((text) => {
            expect(parseFloat(text)).to.not.be.NaN;
        });
}

export function closeSuccessAlert(): void {
    cy.get(closeSuccessNotification, { timeout: 10 * SEC })
        .first()
        .click({ force: true });
}

export function removeMember(memberName: string): void {
    cy.get("span").contains(memberName).siblings(removeButton).click();
}

export function exists(value: string, tableSelector = appTable): void {
    // Wait for DOM to render table and sibling elements
    cy.get(tableSelector, { timeout: 5 * SEC }).then(($tbody) => {
        if ($tbody.text() !== "No data available") {
            selectItemsPerPage(100);
            cy.get(tableSelector, { timeout: 5 * SEC }).should("contain", value);
        }
    });
}

export function notExists(value: string, tableSelector = appTable): void {
    cy.get(tableSelector).then(($tbody) => {
        if ($tbody.text() !== "No data available") {
            selectItemsPerPage(100);
            cy.get(tableSelector, { timeout: 5 * SEC }).should("not.contain", value);
        }
    });
}

export function selectFilter(filterName: string, eq = 0): void {
    if (eq === 0) {
        cy.get(filteredBy).click();
        clickWithinByText('div[class="pf-v5-c-menu__content"]', "button", filterName);
        return;
    }
    cy.get("div.pf-m-filter-group")
        .eq(eq)
        .within(() => {
            cy.get(filteredBy).click();
            clickWithinByText('div[class="pf-v5-c-menu__content"]', "button", filterName);
        });
}

export function filterInputText(searchTextValue: string, value: number): void {
    cy.get(filterInput).eq(value).click().focused().clear();
    cy.wait(200);
    cy.get(filterInput).eq(value).clear().type(searchTextValue);
    cy.get(searchButton).eq(value).click({ force: true });
}

export function clearAllFilters(): void {
    cy.contains(button, "Clear all filters").click({ force: true });
}

export function filterIssueBy(filterType: issueFilter, filterValue: string | string[]): void {
    let selector = "";
    selectFilter(filterType);
    const isApplicableFilter =
        filterType === issueFilter.applicationName ||
        filterType === issueFilter.category ||
        filterType === issueFilter.source ||
        filterType === issueFilter.target;

    if (isApplicableFilter) {
        if (Array.isArray(filterValue)) {
            filterValue.forEach((current) => {
                inputText(searchInput, current);
                click(searchButton);
            });
        } else {
            inputText(searchInput, filterValue);
            click(searchButton);
        }
    } else {
        if (filterType == issueFilter.bs) {
            selector = bsFilterName;
        } else if (filterType == issueFilter.tags) {
            selector = tagFilterName;
        }
        click(selector);
        if (Array.isArray(filterValue)) {
            filterValue.forEach((name) => {
                clickByText(span, name);
            });
        } else {
            clickByText(span, filterValue);
        }
        click(selector);
    }
}

export function validateSingleApplicationIssue(issue: AppIssue): void {
    cy.contains(issue.name)
        .closest(trTag)
        .within(() => {
            validateTextPresence(singleApplicationColumns.issue, issue.name);
            validateTextPresence(singleApplicationColumns.category, issue.category);
            validateTextPresence(singleApplicationColumns.source, issue.sources[0]);
            cy.get(singleApplicationColumns.target).within(() => {
                issue.targets.forEach((currentTarget) => {
                    validateTextPresence(liTag, currentTarget);
                });
            });
            validateNumberPresence(singleApplicationColumns.effort, issue.effort);
            validateNumberPresence(singleApplicationColumns.files, issue.affectedFiles);
        });
}

export function applySelectFilter(
    filterId: string,
    filterName,
    filterText: string,
    isValid = true
): void {
    selectFilter(filterName);
    click(".pf-v5-c-menu-toggle__button");
    inputText(".pf-v5-c-text-input-group__text-input", filterText);
    if (isValid) {
        clickByText(".pf-v5-c-menu__item", filterText);
    } else {
        cy.contains("span.pf-v5-c-menu__item-text", "No results");
    }
    click(".pf-v5-c-text-input-group__text-input");
}

export function applySearchFilter(
    filterName: string,
    searchText: string | string[],
    identifiedRisk = false,
    eq = 0
): void {
    selectFilter(filterName, eq);
    let filterValue = [];
    if (!Array.isArray(searchText)) {
        filterValue = [searchText];
    } else filterValue = searchText;

    cy.get(filterDropDownContainer).then(($container) => {
        if ($container.find(searchMenuToggle).length > 0) {
            cy.get(searchMenuToggle).click();
            filterValue.forEach((searchTextValue) => {
                cy.get(standardFilter).contains(searchTextValue).click();
            });
        } else {
            if ($container.find(filterSelectType).length > 0) {
                cy.get(filterSelectType).click();
                filterValue.forEach((searchTextValue) => {
                    cy.get(standardFilter).contains(searchTextValue).click();
                });
            } else {
                filterValue.forEach((searchTextValue) => {
                    filterInputText(searchTextValue, +identifiedRisk);
                });
            }
        }
    });
    cy.wait(4000);
}

export function clickOnSortButton(
    fieldName: string,
    sortCriteria: string,
    tableSelector: string = commonTable
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

export function getTableColumnData(columnName: string): Array<string> {
    selectItemsPerPage(100);
    let itemList = [];
    cy.get(".pf-v5-c-table > tbody > tr", { timeout: 5 * SEC })
        .not(".pf-v5-c-table__expandable-row")
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

export function verifySortAsc(listToVerify: any[], unsortedList: any[]): void {
    cy.wrap(listToVerify).then((capturedList) => {
        const sortedList = unsortedList.sort((a, b) =>
            a.toString().localeCompare(b, "en-us", {
                numeric: !unsortedList.some(isNaN),
            })
        );
        expect(capturedList).to.be.deep.equal(sortedList);
    });
}

export function verifySortDesc(listToVerify: any[], unsortedList: any[]): void {
    cy.wrap(listToVerify).then((capturedList) => {
        const reverseSortedList = unsortedList.sort((a, b) =>
            b.toString().localeCompare(a, "en-us", {
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
            cy.get(expandRow).then(($btn) => {
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
            cy.get(expandRow).then(($btn) => {
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

export function importApplication(fileName: string, disableAutoCreation?: boolean): void {
    // Performs application import via csv file upload
    application_inventory_kebab_menu("Import");
    cy.get('input[type="file"]', { timeout: 2 * SEC }).selectFile(`cypress/fixtures/${fileName}`, {
        timeout: 120 * SEC,
        force: true,
    });
    //Uncheck createEntitiesCheckbox if auto creation of entities is disabled
    if (disableAutoCreation)
        cy.get(createEntitiesCheckbox).then((enabled) => {
            enabled.prop("checked") ? cy.log("Button is disabled") : click(createEntitiesCheckbox);
        });

    cy.get(appImportForm, { timeout: 5 * SEC })
        .find("button")
        .contains("Import")
        .click();
    checkSuccessAlert(successAlertMessage, `Success! file saved to be processed.`);
}

export function uploadXml(fileName: string, selector = 'input[type="file"]'): void {
    cy.get(selector, { timeout: 5 * SEC }).selectFile(`cypress/fixtures/${fileName}`, {
        timeout: 120 * SEC,
        force: true,
    });
    cy.wait(2000);
}

export function uploadApplications(fileName: string): void {
    cy.get('input[type="file"]', { timeout: 5 * SEC }).selectFile(`cypress/fixtures/${fileName}`, {
        timeout: 120 * SEC,
        force: true,
    });
}

export function uploadFile(fileName: string): void {
    cy.get('input[type="file"]', { timeout: 5 * SEC }).selectFile(`cypress/fixtures/${fileName}`, {
        timeout: 120 * SEC,
        force: true,
    });
    cy.wait(2000);
}

export function navigate_to_application_inventory(): void {
    selectUserPerspective(migration);
    clickByText(navMenu, applicationInventory);
}

export function application_inventory_kebab_menu(menu: string): void {
    // The value for menu could be one of {Import, Manage imports, Delete, Manage credentials}
    navigate_to_application_inventory();

    cy.get(applicationsActionButton, { timeout: 60 * SEC })
        .eq(0)
        .click({ force: true });
    if (menu == "Import") {
        clickByText(button, "Import");
    } else {
        cy.get("span.pf-v5-c-menu__item-text")
            .contains(menu)
            .then(($menu_item) => {
                if (!$menu_item.hasClass("pf-m-disabled")) {
                    clickByText(button, menu, true);
                } else {
                    // close menu if nothing to do
                    cy.get(applicationsActionButton).eq(0).click({ force: true });
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

// Perform edit/delete action on the specified row selector by clicking a text button
export function performRowAction(itemName: string, action: string): void {
    // itemName is text to be searched on the screen (like credentials name, stakeholder name, etc)
    // Action is the name of the action to be applied (usually edit or delete)
    cy.get(tdTag, { timeout: 120 * SEC })
        .contains(itemName, { timeout: 120 * SEC })
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
    cy.contains(itemName, { timeout: 120 * SEC })
        .closest(trTag)
        .scrollIntoView()
        .find(action)
        .first()
        .find("button", { log: true, timeout: 30 * SEC })
        .first()
        .click({ force: true });
}

export function clickItemInKebabMenu(rowItem, itemName: string): void {
    performRowActionByIcon(rowItem, kebabMenu);
    cy.get(actionMenuItem).contains(itemName).closest(button).first().click({ force: true });
}

export function clickKebabMenuOptionArchetype(rowItem: string, itemName: string): void {
    // The clickItemInKebabMenu() fn can't be used on the Archetype page just yet because the
    // the individual archetypes don't have an id for their kebab menu.
    cy.contains(rowItem)
        .closest(trTag)
        .within(() => {
            click(sideKebabMenu);
        });
    cy.get(actionMenuItem).contains(itemName).click({ force: true });
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
    cy.intercept("GET", "/hub/migrationwaves*").as("getWave");
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
        cy.wait("@getWave");
        cy.wait("@getWave", { timeout: 10 * SEC });
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

export function createMultipleArchetypes(number, tags?: Tag[]): Archetype[] {
    const randomTagName = "3rd party / Apache Aries";
    let archetypesList: Archetype[] = [];
    for (let i = 0; i < number; i++) {
        let archetype: Archetype;
        if (tags) archetype = new Archetype(data.getRandomWord(6), [tags[i].name], [tags[i].name]);
        else archetype = new Archetype(data.getRandomWord(6), [randomTagName], [randomTagName]);
        cy.wait(2 * SEC);
        archetype.create();
        cy.wait(2 * SEC);
        archetypesList.push(archetype);
    }
    return archetypesList;
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
        effort: analysisdata.effort,
        excludePackages: analysisdata.excludePackages,
        excludeRuleTags: analysisdata.excludeRuleTags,
        manuallyAnalyzePackages: analysisdata.manuallyAnalyzePackages,
        excludedPackagesList: analysisdata.excludedPackagesList,
        incidents: analysisdata.incidents,
        openSourceLibraries: analysisdata.openSourceLibraries,
        ruleFileToQuantity: analysisdata.ruleFileToQuantity,
    };
}

export function createMultipleApplications(
    numberofapplications: number,
    tags?: string[]
): Array<Application> {
    let applicationList: Array<Application> = [];
    let application: Application;
    for (let i = 0; i < numberofapplications; i++) {
        // Navigate to application inventory tab and create new application
        if (tags) application = new Application(getRandomApplicationData(null, null, tags));
        else application = new Application(getRandomApplicationData());
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
): Array<Application> {
    let applicationList: Array<Application> = [];
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
        const application = new Application(appdata);
        application.create();
        applicationList.push(application);
        cy.wait(2000);
    }
    return applicationList;
}

type Deletable = { delete: () => void };

export function deleteByList<T extends Deletable>(array: T[]): void {
    array.forEach((element) => {
        cy.wait(0.8 * SEC);
        element.delete();
    });
}

export function deleteAllTagsAndTagCategories(): void {
    const nonDefaultTagTypes = [];
    TagCategory.openList();

    cy.get(appTable, { timeout: 2 * SEC })
        .find(trTag)
        .not(expandableRow)
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

export function isTableEmpty(tableSelector: string = commonTable): Cypress.Chainable<boolean> {
    return cy
        .get(tableSelector)
        .find("div")
        .then(($element) => {
            return $element.hasClass("pf-v5-c-empty-state");
        });
}

export function deleteAllRows(tableSelector: string = commonTable) {
    // This method is for pages that have delete button inside Kebab menu
    // like Applications and Imports page
    isTableEmpty().then((empty) => {
        if (!empty) {
            cy.get(tableSelector)
                .find(trTag)
                .then(($rows) => {
                    for (let i = 0; i < $rows.length - 1; i++) {
                        cy.get(sideKebabMenu, { timeout: 10000 }).first().click();
                        cy.get("ul[role=menu] > li").contains("Delete").click();
                        cy.get(confirmButton).click();
                        cy.wait(5000);
                        isTableEmpty().then((empty) => {
                            if (empty) return;
                        });
                    }
                });
        }
    });
}

export function deleteAllImports(tableSelector: string = commonTable) {
    isTableEmpty().then((empty) => {
        if (!empty) {
            cy.get(tableSelector)
                .find(trTag)
                .then(($rows) => {
                    for (let i = 0; i < $rows.length - 1; i++) {
                        cy.get(manageImportsActionsButton, { timeout: 10000 }).eq(1).click();
                        cy.get("ul[role=menu] > li").contains("Delete").click();
                        cy.get(confirmButton).click();
                        cy.wait(2 * SEC);
                    }
                });
        }
    });
}

export function deleteAllItems(tableSelector: string = commonTable, pageNumber?: number) {
    // This method is for pages like controls that do not have delete button inside kebabmenu
    if (pageNumber) {
        goToPage(pageNumber);
    }
    isTableEmpty().then((empty) => {
        if (!empty) {
            cy.get(tableSelector)
                .find(trTag)
                .then(($rows) => {
                    for (let i = 0; i < $rows.length - 1; i++) {
                        cy.get(deleteButton, { timeout: 10000 })
                            .first()
                            .then(($delete_btn) => {
                                if (!$delete_btn.hasClass("pf-m-aria-disabled")) {
                                    $delete_btn.click();
                                    cy.wait(0.5 * SEC);
                                    click(confirmButton);
                                    cy.wait(SEC);
                                }
                            });
                    }
                });
        }
    });
}

export function deleteAllBusinessServices() {
    BusinessServices.openList();
    deleteAllRows();
}

export function deleteAllStakeholderGroups(cancel = false): void {
    Stakeholdergroups.openList();
    deleteAllRows();
}

export function deleteAllStakeholders(): void {
    Stakeholders.openList();
    deleteAllRows(stakeHoldersTable);
}

export function deleteAllArchetypes() {
    Archetype.open();
    selectItemsPerPage(100);
    deleteAllRows();
}

export function deleteApplicationTableRows(): void {
    navigate_to_application_inventory();
    selectItemsPerPage(100);
    deleteAllRows();
}
export function validatePageTitle(pageTitle: string) {
    return cy.get("h1").then((h1) => {
        return h1.text().includes(pageTitle);
    });
}

export function deleteAllMigrationWaves() {
    MigrationWave.open();
    selectItemsPerPage(100);
    // This method if for pages that have delete button inside Kebab menu
    // like Applications and Imports page
    isTableEmpty().then((empty) => {
        if (!empty) {
            cy.get("tbody tr").then(($rows) => {
                for (let i = 0; i < $rows.length; i++) {
                    cy.get(MigrationWaveView.actionsButton, { timeout: 10000 }).first().click();
                    cy.contains("Delete").click();
                    cy.get(confirmButton).click();
                    cy.wait(5000);
                    isTableEmpty().then((empty) => {
                        if (empty) return;
                    });
                }
            });
        }
    });
}

export function deleteAppImportsTableRows() {
    openManageImportsPage();
    selectItemsPerPage(100);
    deleteAllImports();
}

export const deleteFromArray = <T>(array: T[], el: T): T[] => {
    return array.filter((item) => item !== el);
};

export const deleteFromArrayByIndex = <T>(array: T[], index: number): T[] => {
    return array.filter((_, i) => i !== index);
};

export function goToPage(page: number): void {
    cy.get(divHeader)
        .eq(2)
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
    cy.get(optionMenu).click();
    cy.get(actionMenuItem).contains(userType).click({ force: true });
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

export function clickWithin(parent: string, selector: string, isForced = false, log = false): void {
    cy.get(parent, { timeout: 30 * SEC })
        .eq(0)
        .within(() => {
            click(selector, isForced, log);
        });
}

export function clickWithinByText(
    parent: string,
    selector: string,
    text: string,
    isForced = false,
    log = false
): void {
    cy.get(parent, { timeout: 30 * SEC })
        .eq(0)
        .within(() => {
            clickByText(selector, text, isForced, log);
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
            click(tagMenuButton);
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
    cy.get(nextPageButton).eq(0).click({ force: true });

    // Verify that previous buttons are enabled after moving to next page
    cy.get(prevPageButton).each(($previousBtn) => {
        cy.wrap($previousBtn).should("not.be.disabled");
    });

    // Verify that navigation button to first page is enabled after moving to next page
    cy.get(firstPageButton).should("not.be.disabled");

    // Moving back to the first page
    cy.get(firstPageButton).eq(0).click();
}

export function itemsPerPageValidation(tableSelector = appTable, columnName = "Name"): void {
    selectItemsPerPage(10);
    cy.wait(2000);

    // Verify that only 10 items are displayed
    cy.get(tableSelector)
        .find(`td[data-label='${columnName}']`)
        .then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

    selectItemsPerPage(20);
    cy.wait(2000);

    // Verify that items less than or equal to 20 and greater than 10 are displayed
    cy.get(tableSelector)
        .find(`td[data-label='${columnName}']`)
        .then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
}

export function autoPageChangeValidations(
    tableSelector = appTable,
    columnName = "Name",
    deleteInsideKebab: boolean = false
): void {
    selectItemsPerPage(10);
    goToLastPage();
    deleteInsideKebab ? deleteAllRows() : deleteAllItems(tableSelector);
    // Verify that page is re-directed to previous page
    cy.get(`td[data-label='${columnName}']`).then(($rows) => {
        cy.wrap($rows.length).should("eq", 10);
    });
}

export function goToLastPage(): void {
    cy.get(lastPageButton, { timeout: 10 * SEC })
        .eq(1)
        .then(($button) => {
            if (!$button.hasClass(".pf-m-disabled")) {
                $button.click();
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
        const parser = new DOMParser();
        const xmlDOM = parser.parseFromString(data.toString(), "text/xml");
        const serializer = new XMLSerializer();

        xmlDOM.getElementsByTagName("username")[0].childNodes[0].nodeValue = username;
        xmlDOM.getElementsByTagName("password")[0].childNodes[0].nodeValue = password;
        if (url) {
            xmlDOM
                .getElementsByTagName("repository")[1]
                .getElementsByTagName("url")[0].childNodes[0].nodeValue = url;
        }

        cy.writeFile("cypress/fixtures/xml/settings.xml", serializer.serializeToString(xmlDOM));
    });
}

export function writeGpgKey(git_key): void {
    cy.readFile("cypress/fixtures/gpgkey").then((data) => {
        const key = git_key;
        const beginningKey = "-----BEGIN RSA PRIVATE KEY-----";
        const endingKey = "-----END RSA PRIVATE KEY-----";
        const keystring = key.toString().split(" ").join("\n");
        const gpgkey = beginningKey + "\n" + keystring + "\n" + endingKey;
        cy.writeFile("cypress/fixtures/gpgkey", gpgkey);
    });
}

export function doesExistSelector(selector: string, isAccessible: boolean): void {
    cy.get(selector).should(isAccessible ? "exist" : "not.exist");
}

export function doesExistText(str: string, toBePresent: boolean): void {
    cy.contains(str).should(toBePresent ? "exist" : "not.exist");
}

export function doesExistButton(str: string, toBePresent: boolean): void {
    cy.contains(button, str).should(toBePresent ? "exist" : "not.exist");
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

export function getUrl(): string {
    return Cypress.env("tackleUrl");
}

export function getNamespace(): string {
    // This is regexp pattern to search between first `-` and first `.`
    const namespacePattern = /-(.*?)\./;
    // First match, means `-`
    const match = getUrl().match(namespacePattern);
    if (match && match[1]) {
        return match[1].toString();
    } else {
        return "konveyor-tackle";
    }
}

export function patchTackleCR(option: string, isEnabled = true): void {
    let value: string;
    if (isEnabled) {
        value = "true";
    } else {
        value = "false";
    }
    let command = "";
    let namespace = getNamespace();
    let tackleCr = `tackle=$(oc get tackle -n${namespace}|grep -iv name|awk '{print $1}'); `;
    command += tackleCr;
    command += "oc patch tackle ";
    command += "$tackle ";
    command += `-n${namespace} `;
    command += "--type merge ";
    if (option == "configureRWX") command += `--patch '{"spec":{"rwx_supported": ${value}}}'`;
    else if (option == "keycloak")
        command += `--patch '{"spec":{"feature_auth_required": ${value}}}'`;
    else if (option == "metrics") command += `--patch '{"spec":{"hub_metrics_enabled": ${value}}}'`;
    cy.log(command);
    cy.exec(command).then((result) => {
        cy.log(result.stderr);
    });

    // Timeout as it takes time until pods are starting to reboot
    cy.wait(180 * SEC);
    cy.reload();
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

export function next(): void {
    clickByText(button, "Next");
}

export function performWithin(applicationName: string, actionFunction: () => void): void {
    cy.contains(tdTag, applicationName)
        .closest(trTag)
        .within(() => {
            actionFunction();
        });
}

/**
 * Assigns credential to the list of applications
 * @param appList is a list of applications where credential will be assigned
 * @param credential is a credential to assign to those applications
 */
export function manageCredentialsForMultipleApplications(
    appList: Application[],
    credential: Credentials
): void {
    let selector: string;
    Application.open();
    appList.forEach((currentApp: Application) => {
        currentApp.selectApplication();
    });
    clickWithin("#toolbar-kebab", button, false, true);
    clickByText(button, manageCredentials);
    // TODO: Add validation of application list, should be separated with coma in management's modal
    if (credential.type == CredentialType.sourceControl) {
        selector = sourceCredential;
    } else {
        selector = mavenCredential;
    }
    selectFormItems(selector, credential.name);
    clickByText(button, save);
    appList.forEach((currentApp: Application) => {
        currentApp.selectApplication();
    });
}

/**
 * Applies and validates sorting by particular column
 * @param sortBy is column title used for sorting
 * @param tdSelector is an optional parameter that should be equal sortBy if not defined explicitly.
 */
export function validateSortBy(sortBy: string, tdSelector?: string) {
    if (!tdSelector) {
        tdSelector = sortBy;
    }
    const unsortedList = getTableColumnData(tdSelector);

    // Sort the table by column title in ascending order
    clickOnSortButton(sortBy, SortType.ascending);
    cy.wait(2 * SEC);

    // Verify that the table rows are displayed in ascending order
    const afterAscSortList = getTableColumnData(tdSelector);
    verifySortAsc(afterAscSortList, unsortedList);

    // Sort the table by column title in descending order
    clickOnSortButton(sortBy, SortType.descending);
    cy.wait(2 * SEC);

    // Verify that the table rows are displayed in descending order
    const afterDescSortList = getTableColumnData(tdSelector);
    verifySortDesc(afterDescSortList, unsortedList);
}

export function waitUntilSpinnerIsGone(timeout = 300): void {
    cy.get('[class*="spinner"]', { timeout: timeout * SEC }).should("not.exist");
}

export function getCommandOutput(command: string): Cypress.Chainable<Cypress.Exec> {
    return cy.exec(command, { timeout: 30 * SEC }).then((result) => {
        return result;
    });
}

export function isRwxEnabled(): Cypress.Chainable<boolean> {
    let command = "";
    const namespace = getNamespace();
    const tackleCr = `tackle=$(oc get tackle -n${namespace}|grep -iv name|awk '{print $1}'); `;
    command += tackleCr;
    command += `oc get tackle $tackle -n${namespace} -o jsonpath='{.spec.rwx_supported}'`;
    return getCommandOutput(command).then((result) => {
        if (result.stderr !== "") throw new Error(result.stderr.toString());
        return result.stdout.trim().toLowerCase() === "true";
    });
}

export function validateMtaVersionInCLI(expectedMtaVersion: string): void {
    const namespace = getNamespace();
    const podName = `$(oc get pods -n${namespace}| grep ui|cut -d " " -f 1)`;
    const command = `oc describe pod ${podName} -n${namespace}| grep -i version|awk '{print $2}'`;
    getCommandOutput(command).then((output) => {
        if (expectedMtaVersion !== output.stdout) {
            throw new Error(
                `Expected version in UI pod: ${expectedMtaVersion}, Actual version in UI pod: ${output.stdout}`
            );
        }
    });
}

export function validateTackleCr(): void {
    let namespace = getNamespace();
    let tackleCr;
    let command = `tackleCR=$(oc get tackle -n${namespace}|grep -vi name|cut -d ' ' -f 1);`;
    command += `oc get tackle $tackleCr -n${namespace} -o json`;
    getCommandOutput(command).then((result) => {
        try {
            tackleCr = JSON.parse(result.stdout);
        } catch (error) {
            throw new Error("Failed to parse Tackle CR");
        }
        const condition = tackleCr["items"][0]["status"]["conditions"][1];
        const failures = condition["ansibleResult"]["failures"];
        const type = condition["type"];
        cy.log(`Failures: ${failures}`);
        cy.log(`Condition type: ${type}`);
        expect(failures).be.equal(0);
        expect(type).be.equal("Running");
    });
}

export function validateMtaOperatorLog(): void {
    let namespace = getNamespace();
    cy.wait(30 * SEC);
    let command = `oc logs $(oc get pods -n${namespace} | grep mta-operator | cut -d " " -f 1) -n${namespace} | grep failed | tail -n 1| awk -F 'failed=' '{print $2}'|cut -d " " -f 1`;
    getCommandOutput(command).then((result) => {
        const failedCount = parseInt(result.stdout.trim());
        expect(failedCount).equal(0);
    });
}

export function validateMtaVersionInUI(expectedVersion: string): void {
    click(aboutButton);
    cy.contains("dt", "Version")
        .closest("dl")
        .within(() => {
            cy.get("dd").should("contain.text", expectedVersion);
        });
    click(closeAbout);
}

/**
 * Takes 2 arrays of any type and returns array of elements, unique for a second array
 * @param arrA is an array of any type
 * @param arrB is an array of any type
 * @return result
 */
export function getUniqueElementsFromSecondArray<T extends { name: string }>(
    arrA: T[],
    arrB: T[]
): T[] {
    const result: T[] = [];
    const namesInArrA = arrA.map((item) => item.name);
    arrB.forEach((item: T) => {
        if (!namesInArrA.includes(item.name)) {
            result.push(item);
        }
    });
    return result;
}

export function restoreColumnsToDefault(): void {
    openManageColumns();
    clickByText(button, "Restore defaults", true);
    clickByText(button, save, true);
}
export function openManageColumns(): void {
    cy.get(".pf-v5-c-overflow-menu__group.pf-m-button-group").find("button").click();
}

export function validateCheckBoxIsDisabled(checkBoxText: string, isChecked?: boolean): void {
    cy.get(getCheckboxSelector(checkBoxText))
        .should("be.disabled")
        .and(`${isChecked ? "" : "not."}be.checked`);
}

export function getCheckboxSelector(text: string) {
    text = text.toLowerCase().replace(/\s+/g, "");
    return `input[aria-labelledby='check-${text}']`;
}

export function selectColumns(selectedColumns: string[], buttonText: string = save) {
    openManageColumns();
    cy.get(manageColumnsModal)
        .first()
        .within(() => {
            selectedColumns.forEach((column) => {
                cy.get(getCheckboxSelector(column)).click();
            });
            clickByText(button, buttonText, true);
        });
}

export function selectLogView(logName: string): void {
    cy.get(codeEditorControls).within(() => {
        cy.get(menuToggle).click();
        cy.get(menuList).within(() => {
            clickByText(button, logName);
        });
    });
}

/**
 * This function calculates the number of occurrences for each instance name.
 * @param instanceArrays - A two-dimensional array, where each element is an array of instances (such as issues or dependencies).
 * @return A map where the key is the name of each instance and the value is the number of occurrences of that name.
 *
 * The function works as follows:
 * 1. It initializes an empty map to store the instance names and their counts.
 * 2. It iterates over each array of instances.
 * 3. For each instance, it checks if the name already exists in the map.
 *    - If the name exists, it increments the count by 1.
 *    - If the name does not exist, it initializes the count to 1.
 * 4. Finally, it returns the map containing the names and their respective counts.
 */
export function getUniqueNamesMap<T extends { name: string }>(instanceArrays: T[][]): {} {
    const instanceMap = {};

    instanceArrays.forEach((instanceArray) => {
        instanceArray.forEach((instance) => {
            const name = instance.name;
            if (!instanceMap[name]) {
                instanceMap[name] = 0;
            }
            instanceMap[name] += 1;
        });
    });

    return instanceMap;
}

/**
 * Normalizes text by:
 * - Collapsing all sequences of whitespace into a single space.
 * - Trimming leading and trailing whitespace.
 */
export function normalizeText(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

export function taskDetailsSanity(appName: string, taskKind: TaskKind, taskStatus?: TaskStatus) {
    cy.wait(5 * SEC);
    cy.get(taskDetailsEditor)
        .invoke("text")
        .then((text) => {
            const normalizedText = normalizeText(text);
            expect(normalizedText).to.include(`name: ${appName}`);
            expect(normalizedText).to.include(`kind: ${taskKind}`);
            if (taskStatus) {
                expect(normalizedText).to.include(`state: ${taskStatus}`);
            }
        });
}

export function downloadTaskDetails(format = downloadFormatDetails.yaml) {
    cy.url().should("include", "tasks");
    cy.url().then((url) => {
        const taskId = url.split("/").pop();
        const filePath = `cypress/downloads/log-${taskId}.${format.key}`;
        cy.get(format.button).click();
        cy.get(downloadTaskButton).click();
        if (format === downloadFormatDetails.json) {
            cy.readFile(filePath).its("id").should("eq", Number(taskId));
        } else {
            cy.readFile(filePath).should("contain", `id: ${taskId}`);
        }
    });
}

export function limitPodsByQuota(podsNumber: number) {
    const namespace = getNamespace();
    cy.fixture("custom-resource").then((cr) => {
        const manifast = cr["resourceQuota"];
        const command = `PODS_NUMBER=${podsNumber} envsubst < ${manifast} | oc apply -f - -n ${namespace}`;
        getCommandOutput(command).then((output) => {
            expect(output.stdout).to.equal("resourcequota/task-pods created");
        });
    });
}

export function deleteCustomResource(resourceType: string, resourceName: string) {
    const namespace = getNamespace();
    const command = `oc delete ${resourceType} ${resourceName} -n${namespace}`;
    getCommandOutput(command).then((output) => {
        expect(output.code).to.equal(0);
    });
}
