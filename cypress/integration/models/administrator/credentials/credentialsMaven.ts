import { Credentials } from "./credentials";
import { inputText, submitForm } from "../../../../utils/utils";

export class CredentialsMaven extends Credentials {
    type = "Maven Settings File";
    settingsFile = "";

    constructor(name) {
        super(name);
    }

    fillSettingsFile() {
        inputText("#file", this.settingsFile);
    }

    create() {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.fillSettingsFile();
        submitForm();
        this.closeSuccessNotification();
    }
}
