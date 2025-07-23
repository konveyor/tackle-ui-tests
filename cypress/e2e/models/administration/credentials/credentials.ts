import {
    clearAllFilters,
    click,
    clickByText,
    clickItemInKebabMenu,
    doesExistText,
    enumKeys,
    exists,
    inputText,
    notExists,
    performRowAction,
    selectFromDropList,
    selectFromDropListByText,
    selectItemsPerPage,
    selectUserPerspective,
    validateTooLongInput,
    validateTooShortInput,
    validateValue,
} from "../../../../utils/utils";
import {
    administration,
    button,
    credentials,
    CredentialType,
    deleteAction,
    editAction,
    SEC,
    trTag,
} from "../../../types/constants";
import { CredentialsData } from "../../../types/types";
import * as commonView from "../../../views/common.view";
import {
    closeSuccessNotification,
    confirmButton,
    confirmCancelButton,
    navLink,
    searchButton,
    searchInput,
} from "../../../views/common.view";
import {
    createBtn,
    credentialNameInput,
    credLabels,
    descriptionInput,
    filterCatCreatedBy,
    filterCategory,
    filterCatType,
    filteredBy,
    filterSelectType,
    modalBoxBody,
    passwordInput,
    selectType,
    usernameInput,
} from "../../../views/credentials.view";

/**
 * Base class for credentials
 *
 */
export class Credentials {
    /** The name of the credential */
    name = "";

    /** Description of the credential */
    description = "";

    /** Shows the credential type, fields further depend on it */
    type = "";

    /** Keeps state if credential is in use or not */
    inUse = false;

    /** Contains URL of credentials web page */
    static fullUrl = Cypress.config("baseUrl") + "/identities";

    constructor(name?: string) {
        if (name) this.name = name;
    }

    /** This method is validating minimum and maximum length of text fields where it is applicable */
    static validateFields() {
        Credentials.openList();
        click(createBtn);
        Credentials.fillNameTooShort();
        Credentials.fillNameTooLong();
    }

    /**
     * This method validates error message that `Name` field value is too short
     */
    protected static fillNameTooShort(): void {
        validateTooShortInput(credentialNameInput, descriptionInput);
    }

    /**
     * This method validates error message that `Name` field value is too long
     */
    protected static fillNameTooLong(): void {
        validateTooLongInput(credentialNameInput);
    }

    protected static fillUsernameTooShort(): void {
        validateTooShortInput(usernameInput, passwordInput);
    }

    protected static fillUsernameTooLong(): void {
        validateTooLongInput(usernameInput);
    }

    protected static fillPasswordTooShort(): void {
        validateTooShortInput(passwordInput, usernameInput);
    }

    protected static fillPasswordTooLong(): void {
        validateTooLongInput(passwordInput);
    }

    protected fillName(): void {
        inputText(credentialNameInput, this.name);
    }

    protected validateName(name: string) {
        validateValue(credentialNameInput, name);
    }

    protected fillDescription(): void {
        if (this.description != "") {
            inputText(descriptionInput, this.description);
        }
    }

    /** Validates if description field contains same value as sent parameter
     * @param description is the value to compare with existing description
     */
    protected validateDescription(description: string) {
        validateValue(descriptionInput, description);
    }

    protected selectType(type: string): void {
        click(selectType);
        clickByText(button, type);
    }

    /**
     * This method opens list of credentials
     *
     * @param itemsPerPage is optional parameter how many items should be shown on page
     */
    static openList(itemsPerPage = 100) {
        cy.url().then(($url) => {
            if ($url != Credentials.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navLink, credentials);
            }
        });
        cy.contains("h1", "Credentials", { timeout: 120 * SEC });
        selectItemsPerPage(itemsPerPage);
    }

    static getList() {
        return new Promise<Credentials[]>((resolve) => {
            this.openList();
            let list = [];
            cy.get(commonView.appTable, { timeout: 15 * SEC })
                .find(trTag)
                .each(($row) => {
                    let name = $row.find(credLabels.name).text();
                    list.push(new Credentials(name));
                    cy.log(name);
                })
                .then(() => {
                    resolve(list);
                });
        });
    }

    static ApplyFilterByName(value: string) {
        selectFromDropList(filteredBy, filterCategory);
        inputText(searchInput, value);
        click(searchButton);
    }

    static applyFilterByType(type: string) {
        selectFromDropList(filteredBy, filterCatType);
        selectFromDropListByText(filterSelectType, type);
    }

    static applyFilterCreatedBy(value: string) {
        selectFromDropList(filteredBy, filterCatCreatedBy);
        inputText(searchInput, value);
        click(searchButton);
    }

    static filterByType(): void {
        Credentials.openList();
        /*
        CredentialType is enum, here we are getting list of keys from it and iterating this list
        So if more keys and values will be added - there will be no need to put any change here.
        */
        for (const type of enumKeys(CredentialType)) {
            Credentials.applyFilterByType(CredentialType[type]);
            /*
            Applied filter by one of the types and iterate through the whole table comparing
            current filter name with type of each credential in the table
            */
            cy.get(commonView.appTable, { timeout: 15 * SEC })
                .find(trTag)
                .each(($row) => {
                    assert($row.find(credLabels.type), CredentialType[type]);
                });
        }
        clearAllFilters();
    }

    static filterByCreator(name: string): void {
        Credentials.openList();
        Credentials.applyFilterCreatedBy(name);
        cy.get(commonView.appTable, { timeout: 15 * SEC })
            .find(trTag)
            .each(($row) => {
                assert($row.find(credLabels.createdBy), name);
            });
        clearAllFilters();
    }

    create(): void {
        Credentials.openList();
        click(createBtn);
    }

    delete(toBeCanceled = false): void {
        Credentials.openList();
        exists(this.name);
        clickItemInKebabMenu(this.name, deleteAction);
        if (toBeCanceled) {
            click(confirmCancelButton);
            exists(this.name);
        } else {
            cy.get(modalBoxBody).within(() => {
                if (this.inUse) {
                    doesExistText("The credentials are being used by", true);
                }
                doesExistText("This action cannot be undone", true);
            });
            click(confirmButton);
            notExists(this.name);
        }
    }

    edit(cred: CredentialsData): void {
        Credentials.openList();
        performRowAction(this.name, editAction);
    }

    protected closeSuccessNotification(): void {
        cy.get(closeSuccessNotification, { timeout: 10 * SEC })
            .first()
            .click({ force: true });
    }
}
