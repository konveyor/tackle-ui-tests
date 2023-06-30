/** These interfaces contain only the necessary data, not all the keys returned by the API */
export interface JiraProject {
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    simplified: boolean;
    isPrivate: boolean;
    uuid: string;
}

export interface JiraIssueType {
    id: string;
    name: string;
    description: string;
    untranslatedName: string;
    subtask: boolean;
    avatarId: number;
    hierarchyLevel: number;
}

export interface JiraIssue {
    id: string;
    key: string;
    fields: JiraIssueFields;
}

export interface JiraIssueFields {
    summary: string;
    issuetype: JiraIssueType;
    reporter: JiraIssueReporter;
}

export interface JiraIssueReporter {
    self: string;
    accountId: string;
    emailAddress: string;
    displayName: string;
    active: boolean;
}
