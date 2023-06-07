import { Credentials } from "./credentials";
import { CredentialsJiraData } from "../../../types/types";
import {
    cancelForm,
    exists,
    inputText,
    isButtonEnabled,
    notExists,
    submitForm,
    validateValue,
} from "../../../../utils/utils";
import { passwordInput, usernameInput } from "../../../views/credentials.view";
import { button, CredentialType } from "../../../types/constants";
import { submitButton } from "../../../views/common.view";

export class CredentialsJira extends Credentials {
    type = CredentialType.jira;
    email: string;
    token: string;

    constructor(credentialsJiraData: CredentialsJiraData) {
        super();
        this.init(credentialsJiraData);
    }

    protected init(credentialsJiraData: CredentialsJiraData) {
        const { name, description, email, token } = credentialsJiraData;
        this.name = name;
        this.description = description;
        this.email = email;
        this.token = token;
    }

    protected fillEmail() {
        inputText(usernameInput, this.email);
    }

    protected fillToken() {
        inputText(passwordInput, this.token);
    }

    create(toBeCanceled = false) {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.fillEmail();
        this.fillToken();
        if (!toBeCanceled) {
            submitForm();
            this.closeSuccessNotification();
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(credentialsJiraData: CredentialsJiraData, toBeCanceled = false) {
        const oldValues = this.storeOldValues();
        super.edit(null);
        this.init(credentialsJiraData);
        this.fillName();
        isButtonEnabled(submitButton, true);
        this.fillDescription();
        isButtonEnabled(submitButton, true);
        this.fillEmail();
        isButtonEnabled(submitButton, true);
        this.fillToken();
        isButtonEnabled(submitButton, true);
        if (!toBeCanceled) {
            // Edit action is confirmed, submitting form and validating data is updated
            submitForm();
            this.validateValues(credentialsJiraData);
        } else {
            // Edit action was canceled, validating data is NOT updated.
            this.init(oldValues);
            cancelForm();
            this.validateValues(oldValues);
        }
        exists(this.name);
    }

    protected validateEmail(email: string) {
        validateValue(usernameInput, email);
    }

    protected validateValues(credentialsJiraData: CredentialsJiraData): void {
        const { name, description, email } = credentialsJiraData;
        super.edit(null);
        this.validateName(name);
        this.validateDescription(description);
        this.validateEmail(email);
        cancelForm();
    }

    storeOldValues(): CredentialsJiraData {
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            email: this.email,
            token: this.token,
        };
    }
}
