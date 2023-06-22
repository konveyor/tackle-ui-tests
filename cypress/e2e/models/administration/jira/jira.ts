import { CredentialsBasicJira } from "../credentials/credentialsBasicJira";
import { JiraConnectionData } from "../../../types/types";
import {
    cancelForm,
    click,
    clickByText,
    disableSwitch,
    enableSwitch,
    exists,
    inputText,
    notExists,
    performRowAction,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
    validateTextPresence,
} from "../../../../utils/utils";
import {
    instanceName,
    instanceUrl,
    jiraLabels,
    selectCredentialToggle,
    selectTypeToggle,
} from "../../../views/jira.view";
import {
    administration,
    button,
    deleteAction,
    editAction,
    SEC,
    tdTag,
    trTag,
} from "../../../types/constants";
import { cancelButton, confirmButton, navLink } from "../../../views/common.view";
import { JiraIssueType, JiraProject } from "./jira-api.interface";

/**
 * Base class for Jira connection
 *
 */
export class Jira {
    /** Name of Jira connection */
    name: string;
    /** URL of jira instance */
    url: string;
    /** One of possible Jira setup types */
    type: string;
    /** Credential to be used to authorize Jira connection */
    credential: CredentialsBasicJira;
    /** Shows if insecure Jira connection is acceptable or not */
    isInsecure: boolean;

    /** Contains URL of Jira connections web page */
    static fullUrl = Cypress.env("tackleUrl") + "/jira";

    constructor(jiraConnectionData: JiraConnectionData) {
        this.init(jiraConnectionData);
    }

    /**
     * This method opens list of Jira connections
     *
     * @param itemsPerPage is optional parameter defining how many items should be shown on page
     */
    static openList(itemsPerPage = 100) {
        cy.url().then(($url) => {
            if ($url != Jira.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navLink, "Jira");
            }
        });
        cy.contains("h1", "Jira configuration", { timeout: 120 * SEC });
        selectItemsPerPage(itemsPerPage);
    }

    /**
     * This method is initializing values of object class. It is used both in Create and Edit
     * @param jiraConnectionData is required parameter containing all required data to init a Jira connection object
     */
    private init(jiraConnectionData: JiraConnectionData) {
        const { name, url, type, credential, isInsecure } = jiraConnectionData;
        this.name = name;
        this.url = url;
        this.type = type;
        this.credential = credential;
        this.isInsecure = isInsecure;
    }

    /**
     * This method is filling Name field of Jira connection
     */
    private fillName(): void {
        inputText(instanceName, this.name);
    }

    /**
     * This method is filling URL field of Jira connection
     */
    private fillUrl(): void {
        inputText(instanceUrl, this.url);
    }

    /**
     * This method is selecting type of Jira connection
     */
    private selectType(): void {
        click(selectTypeToggle);
        clickByText(button, this.type);
    }

    /**
     * This method is selecting credentials for Jira connection
     */
    private selectCredentials(): void {
        click(selectCredentialToggle);
        clickByText(button, this.credential.name);
    }

    /**
     * This method is enabling/disabling insecure connection according to value in object
     */
    private configureInsecure(): void {
        if (this.isInsecure) {
            enableSwitch("#insecure-switch");
        } else {
            disableSwitch("#insecure-switch");
        }
    }

    /**
     * This method creates new Jira connection according to object values
     *
     * @param toBeCanceled is responsible for canceling creation instead of submitting if set to `true`
     *
     * @param expectedToFail is set to `true` when running negative test, and it is OK that validation fails
     */
    public create(toBeCanceled = false, expectedToFail = false): void {
        Jira.openList();
        click("#create-Tracker");
        this.fillName();
        this.fillUrl();
        this.selectType();
        this.selectCredentials();
        this.configureInsecure();
        if (!toBeCanceled) {
            submitForm();
            this.validateState(expectedToFail);
        } else {
            cancelForm();
            notExists(this.name, "table[aria-label='Jira trackers table']");
        }
    }

    /**
     * This method edits existing Jira connection according to object values
     *
     * @param jiraConnectionData brings new values that should be applied to instance.
     *
     * @param toBeCanceled is responsible for canceling editing instead of submitting if set to `true`
     *
     * @param expectedToFail is set to `true` when running negative test, and it is OK that validation fails
     */
    public edit(
        jiraConnectionData: JiraConnectionData,
        toBeCanceled = false,
        expectedToFail = false
    ): void {
        Jira.openList();
        performRowAction(this.name, editAction);
        const oldValues = this.storeOldValues();
        this.init(jiraConnectionData);
        this.fillName();
        this.fillUrl();
        this.selectType();
        this.selectCredentials();
        this.configureInsecure();
        if (!toBeCanceled) {
            // Edit action is confirmed, submitting form
            submitForm();
        } else {
            // Edit action was canceled
            this.init(oldValues);
            cancelForm();
        }
        this.validateState(expectedToFail);
    }

    /**
     * This method deletes Jira connection
     *
     * @param toBeCanceled is responsible for canceling deletion instead of submitting if set to `true`
     */
    public delete(toBeCanceled = false): void {
        Jira.openList();
        performRowAction(this.name, deleteAction);
        if (toBeCanceled) {
            click(cancelButton);
            this.validateState();
        } else {
            click(confirmButton);
            notExists(this.name, "table[aria-label='Jira trackers table']");
        }
    }

    /**
     * This method validates all fields values of Jira connection after creation
     */
    public validateState(expectedToFail = false): void {
        let expectedStatus: string;
        if (expectedToFail) {
            expectedStatus = "Not connected";
        } else {
            expectedStatus = "Connected";
        }
        // This is horrible, but somehow further code inside `cy.get()` takes OLD values from the object and I need to define separate values and use them to override this problem.
        const name = this.name;
        const url = this.url;

        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(this.name, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                validateTextPresence(jiraLabels.name, name);
                validateTextPresence(jiraLabels.url, url);
                // Commenting check below due to the bug https://issues.redhat.com/browse/MTA-815
                // validateTextPresence(jiraLabels.type, this.type);
                validateTextPresence(jiraLabels.connection, expectedStatus);
            });
    }

    /**
     * This method is reading current values of object fields and returns it as a custom data type.
     *
     * @returns JiraConnectionData
     */
    storeOldValues(): JiraConnectionData {
        return {
            isInsecure: this.isInsecure,
            credential: this.credential,
            name: this.name,
            type: this.type,
            url: this.url,
        };
    }

    public getProjects(): Cypress.Chainable<JiraProject[]> {
        return this.doJiraRequest<JiraProject[]>(`${this.url}/rest/api/3/project`);
    }

    public getIssueTypes(): Cypress.Chainable<JiraIssueType[]> {
        return this.doJiraRequest<JiraIssueType[]>(`${this.url}/rest/api/3/issuetype`);
    }

    private doJiraRequest<T>(url: string): Cypress.Chainable<T> {
        const basicAuth = Buffer.from(`${this.credential.email}:${this.credential.token}`).toString(
            "base64"
        );
        return cy
            .request({
                url: url,
                headers: {
                    Authorization: "Basic " + basicAuth,
                },
            })
            .its("body");
    }
}
