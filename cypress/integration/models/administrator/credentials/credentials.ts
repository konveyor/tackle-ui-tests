import {
    click,
    clickByText,
    inputText,
    performRowAction,
    selectUserPerspective,
    selectItemsPerPage,
    notExists,
} from "../../../../utils/utils";
import {
    administrator,
    button,
    credentials,
    deleteAction,
    editAction,
    SEC,
    trTag,
} from "../../../types/constants";
import {
    createBtn,
    credentialNameInput,
    credLabels,
    descriptionInput,
} from "../../../views/credentials.view";
import { navLink, closeNotification, confirmButton } from "../../../views/common.view";
import { selectType } from "../../../views/credentials.view";
import * as commonView from "../../../views/common.view";
import { CredentialsData } from "../../../types/types";

export class Credentials {
    name = "";
    description = "";
    static credUrl = Cypress.env("tackleUrl") + "/identities";

    constructor(name?) {
        if (name) this.name = name;
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
        click(selectType);
        clickByText(button, type);
    }

    static openList(itemsPerPage = 100) {
        cy.url().then(($url) => {
            if ($url != Credentials.credUrl) {
                selectUserPerspective(administrator);
                clickByText(navLink, credentials);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    static getList() {
        this.openList();
        let list = [];
        cy.get(commonView.appTable, { timeout: 2 * SEC })
            .find(trTag)
            .each(($row) => {
                list.push(new Credentials($row.find(credLabels.name).text()));
            });
        return list;
    }

    create(): void {
        Credentials.openList();
        click(createBtn);
    }

    delete(): void {
        Credentials.openList();
        performRowAction(this.name, deleteAction);
        click(confirmButton);
        notExists(this.name);
    }

    edit(cred: CredentialsData): void {
        Credentials.openList();
        performRowAction(this.name, editAction);
    }

    protected closeSuccessNotification(): void {
        click(closeNotification);
    }
}
