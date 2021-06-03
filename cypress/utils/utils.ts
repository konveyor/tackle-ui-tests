import * as loginView from "../integration/views/login.view";
import * as commonView from "../integration/views/common.view";
import { groupCount, memberCount, tagCount } from "../integration/types/constants";

const userName = Cypress.env("user");
const userPassword = Cypress.env("pass");
const tackleUiUrl = Cypress.env("tackleUrl");
const { _ } = Cypress;

export function inputText(fieldId: string, text: string): void {
    cy.get(fieldId).click().focused().clear().type(text);
}

export function clickByText(fieldId: string, buttonText: string): void {
    // https://github.com/cypress-io/cypress/issues/2000#issuecomment-561468114
    cy.contains(fieldId, buttonText).click({ force: true });
}

export function click(fieldId: string): void {
    cy.get(fieldId).click();
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
    cy.get("h1").contains("Application inventory");
}

export function selectItemsPerPage(items: number): void {
    cy.wait(2000);
    cy.get(commonView.itemsPerPageMenu)
        .find(commonView.itemsPerPageToggleButton)
        .then(($toggleBtn) => {
            if (!$toggleBtn.eq(0).is(":disabled")) {
                $toggleBtn.eq(0).trigger("click");
                cy.get(commonView.itemsPerPageMenuOptions);
                cy.get(`li > button[data-action="per-page-${items}"]`).click();
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

export function selectFilter(filterName: string): void {
    cy.wait(2000);
    cy.get("div.pf-c-input-group").find(commonView.filterToggleButton).click();
    cy.get("ul[role=menu] > li").contains("button", filterName).click();
}

export function applySearchFilter(filterName: string, searchText: string): void {
    selectFilter(filterName);
    inputText(commonView.filterInput, searchText);
    click(commonView.searchButton);
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
    cy.get(`td[data-label="${columnName}"]`).each(($ele) => {
        if (columnName === groupCount || columnName === memberCount || columnName === tagCount) {
            itemList.push(Number($ele.text()));
        } else {
            itemList.push($ele.text().toString().toLowerCase());
        }
    });
    return itemList;
}

export function verifySortAsc(listToVerify: Array<any>): void {
    cy.wrap(listToVerify).then((capturedList) => {
        const sortedList = _.sortBy(capturedList);
        expect(capturedList).to.be.deep.equal(sortedList);
    });
}

export function verifySortDesc(listToVerify: Array<any>): void {
    cy.wrap(listToVerify).then((capturedList) => {
        const reverseSortedList = _.sortBy(capturedList).reverse();
        expect(capturedList).to.be.deep.equal(reverseSortedList);
    });
}
