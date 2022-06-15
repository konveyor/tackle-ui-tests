import {Credentials} from "./credentials";
import {inputText, submitForm} from "../../../../utils/utils";

export class CredentialsProxy extends Credentials {
    type = "Proxy";
    username = "";
    password = "";

    constructor(name, username, password) {
        super(name);
        this.username = username;
        this.password = password;
    }

    fillUsername(){
        inputText("[aria-label='user']", this.username);
    }

    fillPassword(){
        inputText("[aria-label='password']", this.password);
    }

    create(){
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.fillUsername();
        this.fillPassword();
        submitForm();
        this.closeSuccessNotification();
    }

}