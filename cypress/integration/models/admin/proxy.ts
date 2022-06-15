import {
    clearInput,
    click,
    clickByText,
    clickReact,
    inputText,
    selectUserPerspective,
    submitForm
} from "../../../utils/utils";
import {button} from "../../types/constants";
import {CredentialsProxy} from "./credentialsProxy";

export class Proxy {
    hostname = "";
    port = "";
    isHttp = false;
    isHttps = false;
    useCredentials = false;
    credentials: CredentialsProxy;
    excludeList = [];

    constructor(hostname, port: string) {
        this.hostname = hostname;
        this.port = port;
    }

    static open(){
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Proxy");
        cy.contains('h1', 'Proxy configuration', {timeout: 5000});
    }

    // enableSwitch(selector, type: string): boolean {
    //     cy.get(selector).closest("label").within(() => {
    //         cy.contains('span', type).then(($switch) => {
    //             if ($switch.hasClass('pf-m-off')){
    //                 click(selector);
    //                 return true;
    //             }
    //         })
    //     })
    //     return false;
    // }

    // enableSwitch(selector, type: string): void {
    //     // cy.react('Switch', {props: {id: selector}}).getProps().then(($obj) => {
    //     //     if ($obj.)
    //     // })
    //     cy.waitForReact(1000, '#root')
    //     cy.react('Switch', {props: {id: `${selector}`}}).getProps('isChecked')
    //     // cy.pause();
    // }

    protected configureProxy(type: string): void {
        cy.wait(1000); // This wait is required because of problems with page rendering, will be fixed later
        clickReact("Switch", `${type}Proxy`);
        // let updated = this.enableSwitch(`#${type}Proxy`, `${type.toUpperCase()} proxy`);
        // this.enableSwitch(`${type}Proxy`, `${type.toUpperCase()} proxy`);
        inputText(`[name="${type}Host"]`, this.hostname);
        inputText(`[name="${type}Port"]`, this.port);
        if (this.useCredentials && this.credentials) {
            click(`#${type}-identity-required`);
            click(`#${type}-proxy-credentials-select-toggle`)
            clickByText(button, this.credentials.name);
        }
        if (this.excludeList) {
            this.fillExcludeList();
        }
        // if (updated) {
        //     submitForm();
        // }
        submitForm();
    }

    protected unConfigureProxy(type: string): void {
        clearInput(`[name="${type}Host"]`);
        clearInput(`[name="${type}Port"]`);
        click(`#${type}Proxy`);
    }

    fillExcludeList(): void {
        let fullList = "";
        this.excludeList.forEach((current)=> {
            fullList = fullList + current + ', ';
        })
        cy.log(fullList);
        inputText('[aria-label="excluded"]', fullList)
    }

    enable(): void {
        Proxy.open();
        if (this.isHttp) {
            this.configureProxy("http");
        }
        if (this.isHttps) {
            this.configureProxy("https");
        }
    }

    disable(): void {
        Proxy.open();
        clearInput('[aria-label="excluded"]');
        if (this.isHttp) {
            this.unConfigureProxy("http");
        }
        if (this.isHttps) {
            this.unConfigureProxy("https");
        }
    }

    //TODO: Write disable method that will clear all fields and disable proxy
    //TODO: Try to validate current status of switch before clicking
    //TODO: Add filling in exclude list
}
