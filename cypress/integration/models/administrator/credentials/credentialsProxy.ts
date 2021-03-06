import { Credentials } from "./credentials";
import { cancelForm, exists, inputText, notExists, submitForm } from "../../../../utils/utils";
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

    fillUsername() {
        inputText("[aria-label='user']", this.username);
    }

    fillPassword() {
        inputText("[aria-label='password']", this.password);
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
        const oldValues = this.storeOldValues();
        super.edit(oldValues);
        this.init(credentialsProxyData);
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
