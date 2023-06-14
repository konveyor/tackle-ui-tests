import { CredentialsJira } from "../credentials/credentialsJira";
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
    credential: CredentialsJira;
    /** Shows if insecure Jira connection is acceptable or not */
    isInsecure: boolean;

    /** Contains URL of Jira connections web page */
    static fullUrl = Cypress.env("tackleUrl") + "/identities";

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
     */
    public create(toBeCanceled = false): void {
        Jira.openList();
        this.fillName();
        this.fillUrl();
        this.selectType();
        this.selectCredentials();
        this.configureInsecure();
        if (!toBeCanceled) {
            submitForm();
            this.validateState();
        } else {
            cancelForm();
            notExists(this.name);
        }
    }

    /**
     * This method edits existing Jira connection according to object values
     *
     * @param jiraConnectionData brings new values that should be applied to instance.
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
        this.validateState();
        exists(this.name);
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
            exists(this.name);
        } else {
            click(confirmButton);
            notExists(this.name);
        }
    }

    /**
     * This method validates all fields values of Jira connection after creation
     */
    private validateState(): void {
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(this.name, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                this.validateSingleState(jiraLabels.name, this.name);
                this.validateSingleState(jiraLabels.url, this.url);
                // Commenting lines below because of the bug that respective columns have same labels (MTA-766)
                // this.validateSingleState(jiraLabels.type, this.type);
                // this.validateSingleState(jiraLabels.connection, "Connected");
            });
    }

    // This method is actually doing the same what utils/checkSuccessAlert does.
    // TODO: To consider re-use of method in utils
    /**
     * This method is validating field of Jira connection
     *
     * @param FieldId is selector allowing to identify field to be validated
     * @param text contains value to compare with field content
     */
    private validateSingleState(FieldId: string, text: string): void {
        cy.get(FieldId, { timeout: 120 * SEC }).should("contain.text", text);
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
}
