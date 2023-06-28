import { Credentials } from "./credentials";
import { CredentialType } from "../../../types/constants";
import { CredentialsJiraTokenData } from "../../../types/types";
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

export class JiraCredentialsBearer extends Credentials {
    type = CredentialType.jiraBasic;
    key: string;

    constructor(credentialsJiraTokenData: CredentialsJiraTokenData) {
        super();
        this.init(credentialsJiraTokenData);
    }

    protected init(credentialsJiraTokenData: CredentialsJiraTokenData) {
        const { name, description, key } = credentialsJiraTokenData;
        this.name = name;
        this.description = description;
        this.key = key;
    }

    protected fillKey() {
        inputText(passwordInput, this.key);
    }

    create(toBeCanceled = false) {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.fillKey();
        if (!toBeCanceled) {
            submitForm();
            this.closeSuccessNotification();
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(credentialsJiraData: CredentialsJiraTokenData, toBeCanceled = false) {
        const oldValues = this.storeOldValues();
        super.edit(null);
        this.init(credentialsJiraData);
        this.fillName();
        isButtonEnabled(submitButton, true);
        this.fillDescription();
        isButtonEnabled(submitButton, true);
        this.fillKey();
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

    protected validateValues(credentialsJiraData: CredentialsJiraTokenData): void {
        const { name, description } = credentialsJiraData;
        super.edit(null);
        this.validateName(name);
        this.validateDescription(description);
        cancelForm();
    }

    storeOldValues(): CredentialsJiraTokenData {
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            key: this.key,
        };
    }
}
