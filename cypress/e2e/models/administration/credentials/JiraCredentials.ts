import {
    cancelForm,
    exists,
    inputText,
    isButtonEnabled,
    notExists,
    submitForm,
    validateValue,
} from "../../../../utils/utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsJiraData } from "../../../types/types";
import { submitButton } from "../../../views/common.view";
import { keyInput, passwordInput, usernameInput } from "../../../views/credentials.view";
import { Credentials } from "./credentials";

export class JiraCredentials extends Credentials {
    name: string;
    description: string;
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
        inputText(this.type == CredentialType.jiraBasic ? passwordInput : keyInput, this.token);
    }

    protected fillEmail() {
        if (this.type == CredentialType.jiraBasic) {
            inputText(usernameInput, this.email);
        }
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
        } else {
            // Edit action was canceled, validating data is NOT updated.
            this.init(oldValues);
            cancelForm();
        }
        exists(this.name);
    }

    protected validateEmail(email: string) {
        validateValue(usernameInput, email);
    }

    public validateValues(): void {
        super.edit(null);
        this.validateName(this.name);
        this.validateDescription(this.description);
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
