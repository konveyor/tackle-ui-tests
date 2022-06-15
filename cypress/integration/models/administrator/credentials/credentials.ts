import {
    click,
    clickByText,
    inputText,
    performRowAction,
    selectUserPerspective,
    selectWithin,
} from "../../../../utils/utils";
import { dropdownMenuToggle } from "../../../views/tags.view";
import { administrator, button, credentials, deleteAction } from "../../../types/constants";
import { createBtn, credentialNameInput, descriptionInput } from "../../../views/credentials.view";
import { modal, navLink, closeNotification, confirmButton } from "../../../views/common.view";

export class Credentials {
    name = "";
    description = "";

    constructor(name) {
        this.name = name;
    }

    protected fillName(): void {
        inputText(credentialNameInput, this.name);
    }

    protected fillDescription(): void {
        if (this.description != "") {
            inputText(descriptionInput, this.description);
        }
    }

    protected selectType(type): void {
        selectWithin(modal, dropdownMenuToggle);
        clickByText(button, type);
    }

    static openList() {
        selectUserPerspective(administrator);
        clickByText(navLink, credentials);
    }

    create(): void {
        Credentials.openList();
        click(createBtn);
    }

    delete(): void {
        Credentials.openList();
        performRowAction(this.name, deleteAction);
        click(confirmButton);
    }

    closeSuccessNotification(): void {
        click(closeNotification);
    }
}
