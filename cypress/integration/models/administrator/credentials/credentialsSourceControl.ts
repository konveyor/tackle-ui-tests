import { Credentials } from "./credentials";
import { inputText, submitForm } from "../../../../utils/utils";

export class CredentialsSourceControl extends Credentials {
    type = "Source Control";
    username = "";
    password = "";
    key = "";
    keyPassphrase = "";

    constructor(name) {
        super(name);
    }

    fillUsername() {
        inputText("[aria-label='user']", this.username);
    }

    fillPassword() {
        inputText("[aria-label='password']", this.password);
    }

    fillKey() {
        inputText("#file", this.key);
    }
    fillKeyPassphrase() {
        inputText("[aria-label='Private Key Passphrase']", this.keyPassphrase);
    }

    selectCredType() {
        if (this.key == "") {
            this.selectType("Username/Password");
            this.fillUsername();
            this.fillPassword();
        } else {
            this.selectType("Source Private Key/Passphrase");
            this.fillKey();
            this.fillKeyPassphrase();
        }
    }

    create() {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.selectCredType();
        submitForm();
        this.closeSuccessNotification();
    }
}
