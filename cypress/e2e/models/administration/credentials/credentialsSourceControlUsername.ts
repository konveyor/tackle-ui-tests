import {
    cancelForm,
    click,
    clickByText,
    exists,
    inputText,
    notExists,
    submitForm,
} from "../../../../utils/utils";
import { button } from "../../../types/constants";
import { CredentialsSourceControlData } from "../../../types/types";
import { passwordInput, selectType, usernameInput } from "../../../views/credentials.view";
import { CredentialsSourceControl } from "./credentialsSourceControl";

export class CredentialsSourceControlUsername extends CredentialsSourceControl {
    username = "";
    password = "";

    constructor(credentialsSourceControlData: CredentialsSourceControlData) {
        super();
        this.init(credentialsSourceControlData);
    }

    protected init(credentialsSourceControl: CredentialsSourceControlData) {
        const { name, description, username, password } = credentialsSourceControl;
        this.name = name;
        this.description = description;
        this.username = username;
        this.password = password;
    }

    protected fillUsername() {
        inputText(usernameInput, this.username);
    }

    protected fillPassword() {
        inputText(passwordInput, this.password);
    }

    protected selectCredType() {
        click("#user-credentials-select-toggle");
        clickByText(button, "Username/Password");
    }

    create(toBeCanceled = false) {
        super.create();
        this.selectCredType();
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

    // edit(toBeCanceled = false) {
    edit(credentialsSourceControlData: CredentialsSourceControlData, toBeCanceled = false) {
        const oldValues = this.storeOldValues();
        super.edit(oldValues);
        this.init(credentialsSourceControlData);
        this.fillName();
        this.fillDescription();
        this.fillUsername();
        this.fillPassword();
        if (!toBeCanceled) {
            submitForm();
        } else {
            this.init(oldValues);
            cancelForm();
        }
        exists(this.name);
    }

    storeOldValues(): CredentialsSourceControlData {
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
        clickByText(button, "Source Control");
        click("#user-credentials-select-toggle");
        clickByText(button, "Username/Password");
        this.fillUsernameTooShort();
        this.fillUsernameTooLong();
        this.fillPasswordTooShort();
        this.fillPasswordTooLong();
        cancelForm();
    }
}
