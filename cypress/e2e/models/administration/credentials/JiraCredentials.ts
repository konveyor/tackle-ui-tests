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
import { submitButton } from "../../../views/common.view";

export class JiraCredentials extends Credentials {
    type: string;
    token: string;
    email?: string;

    constructor(credentialsJiraData: CredentialsJiraData) {
        super();
        this.init(credentialsJiraData);
    }

    protected init(credentialsJiraData: CredentialsJiraData) {
        const { name, description, token, email, type } = credentialsJiraData;
        this.name = name;
        this.description = description;
        this.token = token;
        this.type = type;
        if (email) this.email = email;
    }

    protected fillToken() {
        inputText(passwordInput, this.token);
    }

    protected fillEmail() {
        if (this.email) inputText(usernameInput, this.email);
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
        const { name, description } = credentialsJiraData;
        super.edit(null);
        this.validateName(name);
        this.validateDescription(description);
        cancelForm();
    }

    storeOldValues(): CredentialsJiraData {
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            token: this.token,
            email: this.email,
        };
    }
}
