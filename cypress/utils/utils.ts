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
import { BusinessServices } from "../integration/models/developer/controls/businessservices";
import { Stakeholders } from "../integration/models/developer/controls/stakeholders";
import { Stakeholdergroups } from "../integration/models/developer/controls/stakeholdergroups";
import { ApplicationInventory } from "../integration/models/developer/applicationinventory/applicationinventory";
import { Tag, Tagtype, clickTags } from "../integration/models/developer/controls/tags";
import { Jobfunctions } from "../integration/models/developer/controls/jobfunctions";

import * as loginView from "../integration/views/login.view";
import * as commonView from "../integration/views/common.view";
import { navMenu } from "../integration/views/menu.view";
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
} from "../integration/types/constants";
import { actionButton, date } from "../integration/views/applicationinventory.view";
import { modal } from "../integration/views/common.view";

const userName = Cypress.env("user");
const userPassword = Cypress.env("pass");
const tackleUiUrl = Cypress.env("tackleUrl");
const { _ } = Cypress;

export function inputText(fieldId: string, text: any): void {
    cy.get(fieldId).click().focused().clear();
    cy.wait(200);
    cy.get(fieldId).clear().type(text);
}

export function clickByText(fieldId: string, buttonText: string): void {
    // https://github.com/cypress-io/cypress/issues/2000#issuecomment-561468114
    cy.contains(fieldId, buttonText).click({ force: true });
}

export function click(fieldId: string): void {
    cy.get(fieldId, { timeout: 120 * SEC }).click({ force: true });
}

export function submitForm(): void {
    cy.get(commonView.submitButton).should("not.be.disabled");
    cy.get(commonView.controlsForm).submit();
}

export function cancelForm(): void {
    cy.get(commonView.cancelButton).click();
}

export function login(): void {
    cy.visit(tackleUiUrl);

    inputText(loginView.userNameInput, userName);
    inputText(loginView.userPasswordInput, userPassword);
    click(loginView.loginButton);
    cy.wait(5000);

    // Change password screen.
    cy.get("h1").then(($a) => {
        if ($a.find("Update Password").length) {
            inputText(loginView.changePasswordInput, userPassword);
            inputText(loginView.confirmPasswordInput, userPassword);
            click(loginView.submitButton);
        }
    });
    cy.wait(5000);
    cy.get("h1", { timeout: 15000 }).contains("Application inventory");
}

export function logout(): void {
    clickByText(button, userName);
    cy.wait(500);
    clickByText("a", "Logout");
    cy.wait(4000);
    cy.get("h1", { timeout: 15000 }).contains("Log in to your account");
}

export function selectItemsPerPage(items: number): void {
    cy.wait(2000);
    cy.get(commonView.itemsPerPageMenu)
        .find(commonView.itemsPerPageToggleButton)
        .then(($toggleBtn) => {
            if (!$toggleBtn.eq(0).is(":disabled")) {
                $toggleBtn.eq(0).trigger("click");
                cy.get(commonView.itemsPerPageMenuOptions);
                cy.get(`li > button[data-action="per-page-${items}"]`).click({ force: true });
                cy.wait(2000);
            }
        });
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

export function checkSuccessAlert(fieldId: string, message: string): void {
    cy.get(fieldId).should("contain.text", message);
}

export function removeMember(memberName: string): void {
    cy.get("span").contains(memberName).siblings(commonView.removeButton).click();
}

export function exists(value: string): void {
    // Wait for DOM to render table and sibling elements
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                selectItemsPerPage(100);
                cy.wait(2000);
                cy.get("td").should("contain", value);
            }
        });
}

export function notExists(value: string): void {
    // Wait for DOM to render table and sibling elements
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                selectItemsPerPage(100);
                cy.wait(2000);
                cy.get("td").should("not.contain", value);
            }
        });
}

export function selectFilter(filterName: string, identifiedRisk?: boolean): void {
    cy.wait(4000);
    if (identifiedRisk) {
        cy.get("div.pf-c-input-group")
            .find(commonView.filterToggleButton)
            .eq(1)
            .click({ force: true });
    } else {
        cy.get("div.pf-c-input-group")
            .get(commonView.filterToggleButton)
            .eq(2)
            .click({ force: true });
    }
    cy.get("ul[role=menu] > li").contains("a", filterName).click();
}

export function filterInputText(searchTextValue: string, value: number): void {
    cy.get(commonView.filterInput).eq(value).click().focused().clear();
    cy.wait(200);
    cy.get(commonView.filterInput).eq(value).clear().type(searchTextValue);
    cy.get(commonView.searchButton).eq(value).click({ force: true });
}

export function applySearchFilter(
    filterName: string,
    searchText: any,
    identifiedRisk?: boolean
): void {
    selectFilter(filterName, identifiedRisk);
    if (filterName == businessService || filterName == tag) {
        cy.get("div.pf-c-input-group").find("div.pf-c-select > div > button").click();
        if (Array.isArray(searchText)) {
            searchText.forEach(function (searchTextValue) {
                cy.get("div.pf-c-select__menu > fieldset > label > span")
                    .contains(searchTextValue)
                    .click();
            });
        } else {
            cy.get("div.pf-c-select__menu > fieldset > label > span").contains(searchText).click();
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

export function sortAsc(sortCriteria: string): void {
    cy.get(`th[data-label="${sortCriteria}"]`).then(($tableHeader) => {
        if (
            $tableHeader.attr("aria-sort") === "descending" ||
            $tableHeader.attr("aria-sort") === "none"
        ) {
            $tableHeader.find("button").trigger("click");
        }
    });
}

export function sortDesc(sortCriteria: string): void {
    cy.get(`th[data-label="${sortCriteria}"]`).then(($tableHeader) => {
        if (
            $tableHeader.attr("aria-sort") === "ascending" ||
            $tableHeader.attr("aria-sort") === "none"
        ) {
            $tableHeader.find("button").trigger("click");
        }
    });
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
    var itemList = [];
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
    cy.wait(4000);
    var itemList = [];
    cy.get(".pf-c-table > tbody > tr")
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
        var sortedList = unsortedList.sort((a, b) =>
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
        var reverseSortedList = unsortedList.sort((a, b) =>
            b.toString().localeCompare(a, "en-us", {
                ignorePunctuation: true,
                numeric: !unsortedList.some(isNaN),
            })
        );
        expect(capturedList).to.be.deep.equal(reverseSortedList);
    });
}

export function expandRowDetails(rowIdentifier: string): void {
    // displays row details by clicking on the expand button
    cy.get(tdTag)
        .contains(rowIdentifier)
        .parent(trTag)
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

export function deleteTableRows(): void {
    cy.get(commonView.appTable).get("tbody").find(trTag).as("rowsIdentifier");
    cy.get("@rowsIdentifier").then(($tableRows) => {
        for (let i = 0; i < $tableRows.length; i++) {
            cy.get("@rowsIdentifier")
                .eq(0)
                .within(() => {
                    click(commonView.deleteButton);
                });
            cy.get(commonView.confirmButton).click();
            cy.wait(2000);
        }
    });
}

export function importApplication(fileName: string): void {
    // Performs application import via csv file upload
    cy.get(actionButton).eq(1).click();
    clickByText(button, "Import");
    cy.wait(500);
    cy.get('input[type="file"]').attachFile(fileName, {
        subjectType: "drag-n-drop",
    });
    cy.wait(2000);
    cy.get("form.pf-c-form").find("button").contains("Import").click({ force: true });
    checkSuccessAlert(commonView.successAlertMessage, `Success! file saved to be processed.`);
}

export function uploadfile(fileName: string): void {
    // Uplaod any file
    cy.wait(500);
    cy.get('input[type="file"]').attachFile(fileName, {
        subjectType: "drag-n-drop",
    });
    cy.wait(2000);
}

export function openManageImportsPage(): void {
    // Opens the manage import applications page
    cy.get(actionButton).eq(1).click();
    cy.get("a.pf-c-dropdown__menu-item").contains("Manage imports").click();
    cy.wait(2000);
    cy.get("h1").contains("Application imports");
}

export function openErrorReport(): void {
    // Open error report for the first row
    cy.get("table > tbody > tr").eq(0).as("firstRow");
    cy.get("@firstRow").find(actionButton).click();
    cy.get("@firstRow").find(button).contains("View error report").click();
    cy.wait(2000);
    cy.get("h1").contains("Error report");
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
    cy.get("@firstRow").find("td[data-label='Accepted']").should("contain", accepted);
    cy.get("@firstRow").find("td[data-label='Rejected']").should("contain", rejected);
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

export function deleteApplicationTableRows(lastPage = false): void {
    if (!lastPage) {
        clickByText(navMenu, applicationInventory);
        cy.wait(800);
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
                        var name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .parent(tdTag)
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

export function preservecookies(): void {
    Cypress.Cookies.defaults({
        preserve: /SESSION/,
    });
}

// Checks if the hook has to be skipped, if the tag is not mentioned during test run
export function hasToBeSkipped(tagName: string): boolean {
    if (Cypress.env("grepTags")) {
        if (!Cypress.env("grepTags").includes(tagName)) return true;
    }
    return false;
}

// Perform edit/delete action on the specified row selector
export function performRowAction(itemName: string, action: string): void {
    // itemName is text to be searched on the screen (like credentials name, stakeholder name, etc)
    // Action is the name of the action to be applied (usually edit or delete)
    cy.contains(itemName, { timeout: 120 * SEC })
        .closest(trTag)
        .within(() => {
            clickByText(button, action);
        });
}

export function createMultipleStakeholders(
    numberofstakeholder: number,
    jobfunctionList?: Array<Jobfunctions>,
    stakeholdergroupsList?: Array<Stakeholdergroups>
): Array<Stakeholders> {
    var stakeholdersList: Array<Stakeholders> = [];
    for (let i = 0; i < numberofstakeholder; i++) {
        var jobfunction: string;
        var stakeholderGroupNames: Array<string> = [];
        if (jobfunctionList) jobfunction = jobfunctionList[i].name;
        if (stakeholdergroupsList) stakeholderGroupNames.push(stakeholdergroupsList[i].name);
        // Create new stakeholder
        const stakeholder = new Stakeholders(
            data.getEmail(),
            data.getFullName(),
            jobfunction,
            stakeholderGroupNames
        );
        stakeholder.create();
        stakeholdersList.push(stakeholder);
    }
    return stakeholdersList;
}
export function createMultipleJobfunctions(num): Array<Jobfunctions> {
    var jobfunctionsList: Array<Jobfunctions> = [];
    for (let i = 0; i < num; i++) {
        const jobfunction = new Jobfunctions(data.getFullName());
        jobfunction.create();
        jobfunctionsList.push(jobfunction);
    }
    return jobfunctionsList;
}

export function createMultipleStakeholderGroups(
    numberofstakeholdergroup: number,
    stakeholdersList?: Array<Stakeholders>
): Array<Stakeholdergroups> {
    var stakeholdergroupsList: Array<Stakeholdergroups> = [];
    for (let i = 0; i < numberofstakeholdergroup; i++) {
        var stakeholders: Array<string> = [];
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
    var businessservicesList: Array<BusinessServices> = [];
    for (let i = 0; i < numberofbusinessservice; i++) {
        var stakeholders: string;
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
    var tagList: Array<Tag> = [];
    for (let i = 0; i < numberoftags; i++) {
        //Create Tag type
        const tagType = new Tagtype(data.getRandomWord(8), data.getColor(), data.getRandomNumber());
        tagType.create();

        // Create new tag
        const tag = new Tag(data.getRandomWord(6), tagType.name);
        tag.create();
        tagList.push(tag);
    }
    return tagList;
}

export function createMultipleApplications(
    numberofapplications: number,
    businessservice?: Array<BusinessServices>,
    tagList?: Array<Tag>
): Array<ApplicationInventory> {
    var applicationList: Array<ApplicationInventory> = [];
    var tags: string[];
    var business: string;
    for (let i = 0; i < numberofapplications; i++) {
        if (!businessservice)
            businessservice = createMultipleBusinessServices(numberofapplications);
        business = businessservice[i].name;
        if (tagList) tags = [tagList[i].name];
        // Navigate to application inventory tab and create new application
        const application = new ApplicationInventory(
            data.getAppName(),
            business,
            data.getDescription(),
            data.getDescription(),
            tags
        );
        application.create();
        applicationList.push(application);
        cy.wait(2000);
    }
    return applicationList;
}

export function createApplicationObjects(numberOfObjects: number): Array<ApplicationInventory> {
    var applicationObjectsList: Array<ApplicationInventory> = [];
    var businessservice = createMultipleBusinessServices(1);
    for (let i = 0; i < numberOfObjects; i++) {
        // Create an object of application
        const application = new ApplicationInventory(data.getAppName(), businessservice[0].name);
        applicationObjectsList.push(application);
    }
    return applicationObjectsList;
}

export function deleteAllJobfunctions(cancel = false): void {
    Jobfunctions.clickJobfunctions();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        var name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .parent(tdTag)
                            .siblings(tdTag)
                            .within(() => {
                                click(commonView.deleteButton);
                                cy.wait(800);
                            });
                        click(commonView.confirmButton);
                        cy.wait(4000);
                    });
            }
        });
}

export function deleteAllStakeholders(cancel = false): void {
    Stakeholders.clickStakeholders();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        var name = $tableRow.find("td[data-label=Email]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .parent(trTag)
                            .within(() => {
                                click(commonView.deleteButton);
                                cy.wait(800);
                            });
                        click(commonView.confirmButton);
                        cy.wait(4000);
                    });
            }
        });
}

export function deleteAllStakeholderGroups(cancel = false): void {
    Stakeholdergroups.clickStakeholdergroups();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        var name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .parent(tdTag)
                            .siblings(tdTag)
                            .within(() => {
                                click(commonView.deleteButton);
                                cy.wait(1000);
                            });
                        click(commonView.confirmButton);
                        cy.wait(4000);
                    });
            }
        });
}

export function deleteAllBusinessServices(cancel = false): void {
    BusinessServices.clickBusinessservices();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        var name = $tableRow.find("td[data-label=Name]").text();
                        cy.get(tdTag)
                            .contains(name)
                            .parent(tdTag)
                            .siblings(tdTag)
                            .within(() => {
                                click(commonView.deleteButton);
                                cy.wait(800);
                            });
                        click(commonView.confirmButton);
                        cy.wait(4000);
                    });
            }
        });
}

export function deleteAllTagTypes(cancel = false): void {
    clickTags();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(commonView.appTable)
        .next()
        .then(($div) => {
            if (!$div.hasClass("pf-c-empty-state")) {
                cy.get("tbody")
                    .find(trTag)
                    .not(".pf-c-table__expandable-row")
                    .each(($tableRow) => {
                        cy.wait(1000);
                        var name = $tableRow.find('td[data-label="Tag type"]').text();
                        if (!(data.getExistingTagtypes().indexOf(name) > -1)) {
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

export function selectUserPerspective(userType: string): void {
    cy.get(commonView.optionMenu)
        .eq(0)
        .then(($a) => {
            $a.click();
            if (userType == "Developer" && $a.find('ul[title="Admin"]').length) {
                clickByText(commonView.userPerspectiveMenu, "Administrator");
                $a.click();
            }
            clickByText(commonView.userPerspectiveMenu, userType);
        });
}

export function selectWithinModal(selector: string): void {
    cy.get(modal).within(() => {
        click(selector);
    });
}

export function selectWithin(parent, selector: string): void {
    cy.get(parent).within(() => {
        click(selector);
    });
}

//function to select checkboxes
export function selectCheckBox(selector: string): void {
    cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
        if (!$checkbox.prop("checked")) {
            click(selector);
        }
    });
}

//function to unselect checkboxes
export function unSelectCheckBox(selector: string): void {
    cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
        if ($checkbox.prop("checked")) {
            click(selector);
        }
    });
}
