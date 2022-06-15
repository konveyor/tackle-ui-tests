import {applyAction, click, clickByText, inputText, selectUserPerspective, selectWithin} from "../../../../utils/utils";
import {dropdownMenuToggle} from "../../../views/tags.view";
import {administrator, button, credentials, deleteAction} from "../../../types/constants";
import {
    closeNotification, confirmButton,
    createBtn,
    credentialNameInput,
    descriptionInput,
    modal,
    navLink
} from "../../../views/credentials.view";

export class Credentials{
    name = "";
    description = "";

    constructor(name) {
        this.name = name;
    }

    protected fillName(): void{
        inputText(credentialNameInput, this.name);
    }

    protected fillDescription(): void{
        if (this.description != "") {
            inputText(descriptionInput, this.description);
        }
    }

    protected selectType(type): void{
        selectWithin(modal, dropdownMenuToggle);
        clickByText(button, type);
    }

    static open(){
        selectUserPerspective(administrator);
        clickByText(navLink, credentials);
    }

    create(): void{
        Credentials.open();
        click(createBtn);
    }

    delete(): void{
        Credentials.open();
        applyAction(this.name, deleteAction);
        click(confirmButton);
    }

    closeSuccessNotification(): void{
        click(closeNotification);
    }
}