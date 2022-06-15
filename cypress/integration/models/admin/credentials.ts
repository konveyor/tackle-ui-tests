import {click, clickByText, inputText, selectUserPerspective, selectWithin} from "../../../utils/utils";
import {dropdownMenuToggle} from "../../views/tags.view";
import {button} from "../../types/constants";

export class Credentials{
    name = "";
    description = "";

    constructor(name) {
        this.name = name;
    }

    fillName(){
        inputText('[aria-label="name"]', this.name);
    }

    fillDescription(){
        if (this.description != "") {
            inputText('[aria-label="description"]', this.description);
        }
    }

    selectType(type) {
        selectWithin("[id^=pf-modal-part-]", dropdownMenuToggle);
        clickByText(button, type);
    }

    static open(){
        selectUserPerspective("Administrator");
        clickByText(".pf-c-nav__link", "Credentials");
    }

    create(){
        Credentials.open();
        click('#create-credential-button');
    }
}