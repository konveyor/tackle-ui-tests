/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { credentials, tdTag, button, createNewButton } from "../../types/constants";
import { navMenu, navTab } from "../../views/menu.view";
import {
    credentialNameInput,
    descriptionInput,
    usernameInput,
    passwordInput,
    privatePassphraseInput,
} from "../../views/credentials.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    selectFormItems,
    uploadfile,
    cancelForm,
    checkSuccessAlert,
    selectReactFormItems,
    selectUserPerspective,
} from "../../../utils/utils";
import * as commonView from "../../views/common.view";

export class Credentials {
    name: string;
    description: string;
    type: string;
    userCredentials: string;
    username?: string;
    password?: string;
    fileName?: string;
    privatePassphrase?: string;

    constructor(
        name: string,
        description: string,
        type: string,
        userCredentials: string,
        username?: string,
        password?: string,
        fileName?: string,
        privatePassphrase?: string
    ) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.userCredentials = userCredentials;
        if (username) this.username = username;
        if (password) this.password = password;
        if (fileName) this.fileName = fileName;
        if (privatePassphrase) this.privatePassphrase = privatePassphrase;
    }

    public static clickCredentials(): void {
        selectUserPerspective("Administrator");
        clickByText(navMenu, credentials);
    }

    protected fillName(name: string): void {
        inputText(credentialNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(descriptionInput, description);
    }

    protected selectType(type: string): void {
        selectReactFormItems("kind", type);
    }

    protected selectUserCrdentials(userCredentials: string): void {
        selectReactFormItems("userCredentials", userCredentials);
    }

    protected fillUsername(username: string): void {
        inputText(usernameInput, username);
    }

    protected fillPassword(password: string): void {
        inputText(passwordInput, password);
    }

    protected uploadSSHKey(fileName: string): void {
        uploadfile(fileName);
    }

    protected fillPrivatePassphrase(privatePassphrase: string): void {
        inputText(privatePassphraseInput, privatePassphrase);
    }

    create(cancel = false): void {
        Credentials.clickCredentials();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.fillDescription(this.description);
            this.selectType(this.type);
            if (this.type == "Source Control") {
                this.selectUserCrdentials(this.userCredentials);
                if (this.userCredentials == "Username/Password") {
                    this.fillUsername(this.username);
                    this.fillPassword(this.password);
                }
                if (this.userCredentials == "Source Private Key/Passphrase") {
                    uploadfile(this.fileName);
                    if (this.privatePassphrase) this.fillPrivatePassphrase(this.privatePassphrase);
                }
            }

            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a(n) terms.identity.`
            );
        }
    }
}
