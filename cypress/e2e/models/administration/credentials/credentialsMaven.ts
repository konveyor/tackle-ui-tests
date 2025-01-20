import {
    cancelForm,
    clickByText,
    exists,
    notExists,
    submitForm,
    uploadFile,
} from "../../../../utils/utils";
import { button } from "../../../types/constants";
import { CredentialsMavenData } from "../../../types/types";
import { Credentials } from "./credentials";

export class CredentialsMaven extends Credentials {
    type = "Maven Settings File";
    settingsFile = "";

    constructor(credentialsMavenData: CredentialsMavenData) {
        super();
        this.init(credentialsMavenData);
    }

    protected init(credentialsMavenData: CredentialsMavenData) {
        const { name, description, settingFile } = credentialsMavenData;
        this.name = name;
        this.description = description;
        this.settingsFile = settingFile;
    }

    protected fillSettingsFile() {
        uploadFile(this.settingsFile);
    }

    create(toBeCanceled = false) {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
        this.fillSettingsFile();
        if (!toBeCanceled) {
            submitForm();
            exists(this.name);
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    edit(credentialsMavenData: CredentialsMavenData, toBeCanceled = false) {
        const oldValues = this.storeOldValues();
        super.edit(oldValues);
        this.init(credentialsMavenData);
        this.fillName();
        this.fillDescription();
        clickByText(button, "Clear");
        this.fillSettingsFile();
        if (!toBeCanceled) {
            submitForm();
        } else {
            this.init(oldValues);
            cancelForm();
        }
        exists(this.name);
    }

    storeOldValues(): CredentialsMavenData {
        return {
            name: this.name,
            description: this.description,
            settingFile: this.settingsFile,
            type: this.type,
        };
    }
}
