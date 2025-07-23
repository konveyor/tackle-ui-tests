import {
    cancelForm,
    click,
    clickByText,
    disableSwitch,
    enableSwitch,
    inputText,
    notExists,
    performRowAction,
    selectFromDropList,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
    validateTextPresence,
} from "../../../../utils/utils";
import {
    administration,
    button,
    CredentialType,
    deleteAction,
    editAction,
    SEC,
    tdTag,
    trTag,
} from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";
import { confirmButton, confirmCancelButton, navLink } from "../../../views/common.view";
import { filterCategory, filteredBy, searchButton } from "../../../views/credentials.view";
import { searchInput } from "../../../views/issue.view";
import {
    createJiraButton,
    instanceName,
    instanceUrl,
    jiraLabels,
    selectCredentialToggle,
    selectTypeToggle,
} from "../../../views/jira.view";
import { JiraCredentials } from "../credentials/JiraCredentials";
import { JiraIssue, JiraIssueType, JiraProject } from "./jira-api.interface";

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
    credential: JiraCredentials;
    /** Shows if insecure Jira connection is acceptable or not */
    isInsecure: boolean;

    /** Contains URL of Jira connections web page */
    static fullUrl = Cypress.config("baseUrl") + "/jira";

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
    protected fillName(): void {
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
     */
    public create(toBeCanceled = false): void {
        Jira.openList();
        click(createJiraButton);
        this.fillName();
        this.fillUrl();
        this.selectType();
        this.selectCredentials();
        this.configureInsecure();
        if (!toBeCanceled) {
            submitForm();
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
     */
    public edit(jiraConnectionData: JiraConnectionData, toBeCanceled = false): void {
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
            click(confirmCancelButton);
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
        // As 'within' uses callback function, object values inside of it may differ from values outside. Saving them separately to avoid this affect.
        const name = this.name;
        const url = this.url;

        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(this.name, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                validateTextPresence(jiraLabels.name, name);
                validateTextPresence(jiraLabels.url, url);
                validateTextPresence(jiraLabels.type, this.type);
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

    static applyFilterByName(value: string) {
        selectFromDropList(filteredBy, filterCategory);
        inputText(searchInput, value);
        click(searchButton);
    }

    public getAllProjects(): Cypress.Chainable<JiraProject[]> {
        return this.doJiraRequest<JiraProject[]>(`${this.url}/rest/api/2/project`);
    }

    public getProject(projectName = "Test"): Cypress.Chainable<JiraProject | null> {
        return this.getAllProjects().then((projects) => {
            return projects.find((project) => project.name === projectName);
        });
    }

    /**
     * In some cases, the token may not have permissions to list all projects
     * @param projectId
     */
    public getProjectById(projectId: number): Cypress.Chainable<JiraProject | null> {
        return this.doJiraRequest<JiraProject>(`${this.url}/rest/api/2/project/${projectId}`);
    }

    public getAllIssueTypes(): Cypress.Chainable<JiraIssueType[]> {
        return this.doJiraRequest<JiraIssueType[]>(`${this.url}/rest/api/2/issuetype`);
    }

    public getIssueType(type: string): Cypress.Chainable<JiraIssueType | null> {
        return this.getAllIssueTypes().then((issueTypes) => {
            return issueTypes.find((issueType) => issueType.name === type);
        });
    }

    /**
     * Deletes multiple issues by their IDs
     * @param issueIds
     */
    public deleteIssues(issueIds: string[]): void {
        issueIds.forEach((id) =>
            this.doJiraRequest(`${this.url}/rest/api/2/issue/${id}`, "DELETE")
        );
    }

    /**
     * Archives multiple issues by their IDs, this will prevent them from appearing when searching issues
     * This method should be used if the Jira user doesn't have permission to delete issues
     * @param issueIds
     */
    public archiveIssues(issueIds: string[]): void {
        issueIds.forEach((id) =>
            this.doJiraRequest(`${this.url}/rest/api/2/issue/${id}/archive`, "PUT")
        );
    }

    public getIssues(projectName: string): Cypress.Chainable<JiraIssue[]> {
        return this.doJiraRequest<JiraIssue[]>(
            `${this.url}/rest/api/2/search?jql=project="${projectName}"`
        ).its("issues");
    }

    private doJiraRequest<T>(url: string, method = "GET"): Cypress.Chainable<T> {
        const basicAuth =
            "Basic " +
            Buffer.from(`${this.credential.email}:${this.credential.token}`).toString("base64");
        const bearerAuth = "Bearer " + this.credential.token;
        return cy
            .request({
                url: url,
                method,
                headers: {
                    "X-Atlassian-Token": "no-check",
                    "User-Agent": "DUMMY-USER-AGENT",
                    Authorization:
                        this.credential.type === CredentialType.jiraBasic ? basicAuth : bearerAuth,
                },
            })
            .its("body");
    }
}
