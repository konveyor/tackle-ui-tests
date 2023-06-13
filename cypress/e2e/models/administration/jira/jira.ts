import { CredentialsJira } from "../credentials/credentialsJira";
import { JiraConnectionData } from "../../../types/types";
import {
    cancelForm,
    click,
    clickByText,
    disableSwitch,
    enableSwitch,
    inputText,
    notExists,
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
import { administration, button, SEC, tdTag, trTag } from "../../../types/constants";
import { navLink } from "../../../views/common.view";

export class Jira {
    name: string;
    url: string;
    type: string;
    credential: CredentialsJira;
    isInsecure: boolean;

    /** Contains URL of Jira connections web page */
    static fullUrl = Cypress.env("tackleUrl") + "/identities";

    constructor(jiraConnectionData: JiraConnectionData) {
        this.init(jiraConnectionData);
    }

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

    private init(jiraConnectionData: JiraConnectionData) {
        const { name, url, type, credential, isInsecure } = jiraConnectionData;
        this.name = name;
        this.url = url;
        this.type = type;
        this.credential = credential;
        this.isInsecure = isInsecure;
    }

    private fillName(): void {
        inputText(instanceName, this.name);
    }

    private fillUrl(): void {
        inputText(instanceUrl, this.url);
    }

    private selectType(): void {
        click(selectTypeToggle);
        clickByText(button, this.type);
    }

    private selectCredentials(): void {
        click(selectCredentialToggle);
        clickByText(button, this.credential.name);
    }

    private configureInsecure(): void {
        if (this.isInsecure) {
            enableSwitch("#insecure-switch");
        } else {
            disableSwitch("#insecure-switch");
        }
    }

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

    private validateState(): void {
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(this.name, { timeout: 120 * SEC })
            // .closest(tdTag)
            .closest(trTag)
            .within(() => {
                this.validateSingleState(jiraLabels.name, this.name);
                this.validateSingleState(jiraLabels.url, this.url);
                // Commenting line below because of the bug that respective columns have same labels (bug will be opened)
                // this.validateSingleState(jiraLabels.type, this.type);
                // this.validateSingleState(jiraLabels.connection, "Connected");
            });
    }

    // This method is actually doing the same what utils/checkSuccessAlert does.
    // TODO: To consider re-use of method in utils
    private validateSingleState(FieldId, text: string): void {
        cy.get(FieldId, { timeout: 120 * SEC }).should("contain.text", text);
    }

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
