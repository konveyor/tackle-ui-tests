import { Credentials } from "./credentials";
import {
    cancelForm,
    exists,
    inputText,
    notExists,
    submitForm,
    validateValue,
} from "../../../../utils/utils";
import { CredentialsProxyData } from "../../../types/types";

export class CredentialsProxy extends Credentials {
    type = "Proxy";
    username = "";
    password = "";

    constructor(credentialsProxyData: CredentialsProxyData) {
        super();
        this.init(credentialsProxyData);
    }

    protected init(credentialsProxyData: CredentialsProxyData) {
        const { name, description, username, password } = credentialsProxyData;
        this.name = name;
        this.description = description;
        this.username = username;
        this.password = password;
    }

    protected fillUsername() {
        inputText("[aria-label='proxy-user']", this.username);
    }

    protected validateUsername(username: string) {
        validateValue("[aria-label='proxy-user']", username);
    }

    protected fillPassword() {
        inputText("[aria-label='proxy-password']", this.password);
    }

    create(toBeCanceled = false) {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.fillUsername();
        this.fillPassword();
        if (!toBeCanceled) {
            submitForm();
            this.closeSuccessNotification();
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(credentialsProxyData: CredentialsProxyData, toBeCanceled = false) {
        if (!toBeCanceled) {
            const { name, description, username, password } = credentialsProxyData;
            cy.log(`Name: ${name}`);
            cy.log(`Description: ${description}`);
            cy.log(`Username: ${username}`);
            cy.log(`Password: ${password}`);
        }
        const oldValues = this.storeOldValues();
        super.edit(oldValues);
        // if (!toBeCanceled) {
        this.init(credentialsProxyData);
        // }
        this.fillName();
        this.fillDescription();
        this.fillUsername();
        this.fillPassword();
        if (!toBeCanceled) {
            // Edit action is confirmed, submitting form and validating data is updated
            submitForm();
            this.validateValues(credentialsProxyData);
        } else {
            // Edit action was canceled, validating data is NOT updated.
            this.init(oldValues);
            cancelForm();
            this.validateValues(oldValues);
        }
        exists(this.name);
    }

    protected validateValues(credentialsProxyData: CredentialsProxyData): void {
        const { name, description, username } = credentialsProxyData;
        super.edit(credentialsProxyData);
        this.validateName(name);
        this.validateDescription(description);
        this.validateUsername(username);
        cancelForm();
    }

    storeOldValues(): CredentialsProxyData {
        return;
        {
            name: this.name;
            description: this.description;
            username: this.username;
            password: this.password;
        }
    }
}
