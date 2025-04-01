import {
    cancelForm,
    click,
    clickByText,
    exists,
    inputText,
    notExists,
    submitForm,
    uploadFile,
} from "../../../../utils/utils";
import { button } from "../../../types/constants";
import { CredentialsSourceControlPrivateKeyData } from "../../../types/types";
import { CredentialsSourceControl } from "./credentialsSourceControl";

export class CredentialsSourceControlKey extends CredentialsSourceControl {
    key = "";
    keyPassphrase = "";

    constructor(credentialsSourceControl: CredentialsSourceControlPrivateKeyData) {
        super();
        this.init(credentialsSourceControl);
    }

    protected init(credentialsSourceControl: CredentialsSourceControlPrivateKeyData) {
        const { name, description, key, passphrase } = credentialsSourceControl;
        this.name = name;
        this.description = description;
        this.key = key;
        this.keyPassphrase = passphrase;
    }

    fillKey() {
        uploadFile(this.key);
    }

    protected fillKeyPassphrase() {
        inputText("#password", this.keyPassphrase);
    }

    protected selectCredType() {
        click("#user-credentials-select-toggle");
        clickByText(button, "Source Private Key/Passphrase");
    }

    create(toBeCanceled = false) {
        super.create();
        this.selectCredType();
        this.fillKey();
        if (this.keyPassphrase) this.fillKeyPassphrase();
        if (!toBeCanceled) {
            submitForm();
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(
        credentialsSourceControlData: CredentialsSourceControlPrivateKeyData,
        toBeCanceled = false
    ) {
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

    storeOldValues(): CredentialsSourceControlPrivateKeyData {
        return {
            name: this.name,
            type: this.type,
            description: this.description,
            key: this.key,
            passphrase: this.keyPassphrase,
        };
    }
}
