import { controls, tags, tdTag, trTag, button } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";

import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    checkSuccessAlert,
    expandRowDetails,
    closeRowDetails,
} from "../../utils/utils";
import * as commonView from "../views/common.view";
import {
    dropdownMenuToggle,
    createTagButton,
    createTagtypeButton,
    nameInput,
    rankInput,
    tagMenuButton,
} from "../views/tags.view";

export function clickTags(): void {
    clickByText(navMenu, controls);
    clickByText(navTab, tags);
}

export function fillName(name: string): void {
    inputText(nameInput, name);
}

export class Tag {
    name: string;
    tagtype: string;

    constructor(name: string, tagtype: string) {
        this.name = name;
        this.tagtype = tagtype;
    }

    protected selectTagtype(tagtype: string): void {
        click(dropdownMenuToggle);
        clickByText(button, tagtype);
    }

    protected clickTagAction(buttonName: string): void {
        // Performs action (edit and delete only) by clicking tag options menu for a specific tag
        cy.get(tdTag)
            .contains(this.tagtype)
            .parent(trTag)
            .next()
            .find(tdTag)
            .contains(this.name)
            .siblings()
            .find(tagMenuButton)
            .click()
            .next()
            .contains(button, buttonName)
            .click();
    }

    create(cancel = false): void {
        clickTags();
        clickByText(button, createTagButton);
        if (cancel) {
            cancelForm();
        } else {
            fillName(this.name);
            this.selectTagtype(this.tagtype);
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a tag.`
            );
        }
    }

    edit(updatedValue: { name?: string; tagtype?: string }, cancel = false): void {
        clickTags();
        selectItemsPerPage(100);
        cy.wait(2000);
        expandRowDetails(this.tagtype);
        this.clickTagAction("Edit");
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.tagtype && updatedValue.tagtype != this.tagtype) {
                this.selectTagtype(updatedValue.tagtype);
                this.tagtype = updatedValue.tagtype;
            }
            if (updatedValue) submitForm();
        }
        closeRowDetails(this.tagtype);
    }

    delete(cancel = false): void {
        clickTags();
        selectItemsPerPage(100);
        cy.wait(2000);
        expandRowDetails(this.tagtype);
        this.clickTagAction("Delete");
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
        closeRowDetails(this.tagtype);
    }
}

export class Tagtype {
    name: string;
    rank: number;
    color: string;

    constructor(name: string, color: string, rank?: number) {
        this.name = name;
        this.color = color;
        if (rank) this.rank = rank;
    }

    protected selectColor(color: string): void {
        click(dropdownMenuToggle);
        clickByText(button, color);
    }

    protected fillRank(rank: number): void {
        inputText(rankInput, rank);
    }

    create(cancel = false): void {
        clickTags();
        clickByText(button, createTagtypeButton);
        if (cancel) {
            cancelForm();
        } else {
            fillName(this.name);
            this.selectColor(this.color);
            if (this.rank) this.fillRank(this.rank);
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a tag type.`
            );
        }
    }

    edit(updatedValue: { name?: string; rank?: number; color?: string }, cancel = false): void {
        clickTags();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .within(() => {
                click(commonView.editButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.rank && updatedValue.rank != this.rank) {
                this.fillRank(updatedValue.rank);
                this.rank = updatedValue.rank;
            }
            if (updatedValue.color && updatedValue.color != this.color) {
                this.selectColor(updatedValue.color);
                this.color = updatedValue.color;
            }
            if (updatedValue) submitForm();
        }
    }

    delete(cancel = false): void {
        clickTags();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .within(() => {
                click(commonView.deleteButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
    }
}
