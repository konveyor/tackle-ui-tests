import { CredentialsJira } from "../credentials/credentialsJira";
import { JiraConnectionData } from "../../../types/types";
import { inputText } from "../../../../utils/utils";
import { instanceName, instanceUrl } from "../../../views/jira.view";

export class Jira {
    name: string;
    url: string;
    type: string;
    credential: CredentialsJira;

    constructor(jiraConnectionData: JiraConnectionData) {
        this.init(jiraConnectionData);
    }

    private init(jiraConnectionData: JiraConnectionData) {
        const { name, url, type, credential } = jiraConnectionData;
        this.name = name;
        this.url = url;
        this.type = type;
        this.credential = new CredentialsJira(credential);
    }

    private fillName(): void {
        inputText(instanceName, this.name);
    }

    private fillUrl(): void {
        inputText(instanceUrl, this.url);
    }

    public create(): void {
        this.fillName();
        this.fillUrl();
    }
}
