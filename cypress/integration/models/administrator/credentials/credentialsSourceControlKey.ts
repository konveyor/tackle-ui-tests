import { CredentialsSourceControl } from "./credentialsSourceControl";
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

export class CredentialsSourceControlKey extends CredentialsSourceControl {
    key = "";
    keyPassphrase = "";

    constructor(credentialsSourceControl: CredentialsSourceControlData) {
        super();
        this.init(credentialsSourceControl);
    }

    protected init(credentialsSourceControl: CredentialsSourceControlData) {
        const { name, description, username, password } = credentialsSourceControl;
        this.name = name;
        this.description = description;
        this.key = username;
        this.keyPassphrase = password;
    }

    fillKey() {
        inputText("#file", this.key);
    }

    protected fillKeyPassphrase() {
        inputText("[aria-label='private-key-passphrase']", this.keyPassphrase);
    }

    protected selectCredType() {
        click("#user-credentials-select-toggle");
        clickByText(button, "Source Private Key/Passphrase");
    }

    create(toBeCanceled = false) {
        super.create();
        this.selectCredType();
        this.fillKey();
        this.fillKeyPassphrase();
        if (!toBeCanceled) {
            submitForm();
            this.closeSuccessNotification();
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(credentialsSourceControlData: CredentialsSourceControlData, toBeCanceled = false) {
        const oldValues = this.storeOldValues();
        super.edit(oldValues);
        this.init(credentialsSourceControlData);
        this.fillName();
        this.fillDescription();
        this.fillKey();
        this.fillKeyPassphrase();
        if (!toBeCanceled) {
            submitForm();
        } else {
            this.init(oldValues);
            cancelForm();
        }
        exists(this.name);
    }

    storeOldValues(): CredentialsSourceControlData {
        return;
        {
            name: this.name;
            description: this.description;
            username: this.key;
            password: this.keyPassphrase;
        }
    }
}
