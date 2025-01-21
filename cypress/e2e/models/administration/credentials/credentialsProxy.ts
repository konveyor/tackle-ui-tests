import {
    cancelForm,
    click,
    clickByText,
    exists,
    inputText,
    notExists,
    submitForm,
    validateValue,
} from "../../../../utils/utils";
import { button, CredentialType } from "../../../types/constants";
import { CredentialsProxyData } from "../../../types/types";
import { selectType, usernameInput } from "../../../views/credentials.view";
import { userPasswordInput } from "../../../views/login.view";
import { Credentials } from "./credentials";

export class CredentialsProxy extends Credentials {
    type = CredentialType.proxy;
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
        inputText(usernameInput, this.username);
    }

    protected validateUsername(username: string) {
        validateValue(usernameInput, username);
    }

    protected fillPassword() {
        inputText(userPasswordInput, this.password);
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
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(credentialsProxyData: CredentialsProxyData, toBeCanceled = false) {
        const oldValues = this.storeOldValues();
        super.edit(oldValues);
        this.init(credentialsProxyData);
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
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            username: this.username,
            password: this.password,
        };
    }

    static validateFields() {
        super.validateFields();
        click(selectType);
        clickByText(button, "Proxy");
        this.fillUsernameTooShort();
        this.fillUsernameTooLong();
        this.fillPasswordTooShort();
        this.fillPasswordTooLong();
        cancelForm();
    }
}
