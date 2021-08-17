import * as loginView from "../integration/views/login.view";
import * as commonView from "../integration/views/common.view";
import "cypress-file-upload";
import {
    businessservice,
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
} from "../integration/types/constants";
import { actionButton } from "../integration/views/applicationinventory.view";

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
    cy.get(fieldId).click({ force: true });
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
            .eq(0)
            .find(commonView.filterToggleButton)
            .click({ force: true });
    }
    cy.get("ul[role=menu] > li").contains("button", filterName).click();
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
    if (filterName == businessservice || filterName == tag) {
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
    cy.wait(2000);
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

export function getTableColumnData(columnName: string): Array<string> {
    selectItemsPerPage(100);
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

export function deleteApplicationTableRows(): void {
    cy.get(commonView.appTable)
        .get("tbody")
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
