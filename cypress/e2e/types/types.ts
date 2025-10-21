import { CredentialsSourceControl } from "../models/administration/credentials/credentialsSourceControl";
import { JiraCredentials } from "../models/administration/credentials/JiraCredentials";
import { CustomRuleType, Languages, RepositoryType } from "./constants";

export type CredentialsSourceControlData = {
    type: string;
    name?: string;
    description?: string;
    username?: string;
    password?: string;
    isDefault?: boolean;
};

export type CredentialsSourceControlPrivateKeyData = {
    type: string;
    name?: string;
    description?: string;
    key?: any;
    passphrase?: string;
};

export type CredentialsProxyData = {
    type: string;
    name?: string;
    description?: string;
    username?: string;
    password?: string;
};

export type CredentialsMavenData = {
    type: string;
    name?: string;
    description?: string;
    settingFile?: any;
    isDefault?: boolean;
};

export type CredentialsJiraBasicData = {
    type: string;
    name?: string;
    description?: string;
    email?: string;
    token?: string;
};

export type CredentialsJiraTokenData = {
    type: string;
    name?: string;
    description?: string;
    key?: string;
};

export type CredentialsJiraData = {
    type: string;
    name?: string;
    description?: string;
    email?: string;
    token?: string;
};

export type CredentialsData =
    | CredentialsProxyData
    | CredentialsSourceControlData
    | CredentialsMavenData
    | CredentialsSourceControlPrivateKeyData
    | CredentialsJiraData;

export type JiraConnectionData = {
    name: string;
    url: string;
    type: string;
    credential: JiraCredentials;
    isInsecure?: boolean;
};

export type applicationData = {
    name: string;
    business?: string;
    description?: string;
    tags?: Array<string>;
    comment?: string;
    analysis?: boolean;
    repoType?: string;
    sourceRepo?: string;
    branch?: string;
    rootPath?: string;
    group?: string;
    artifact?: string;
    version?: string;
    packaging?: string;
    owner?: string;
    contributor?: string;
};

export type ProxyData = {
    hostname: string;
    port: string;
    httpEnabled: boolean;
    credentials?: CredentialsProxyData;
    httpsEnabled: boolean;
    excludeList?: string[];
};

export type analysisData = {
    source: string;
    target: string[];
    binary?: string[];
    scope?: string;
    customRule?: string[];
    customRuleRepository?: RulesRepositoryFields;
    sources?: string;
    excludeRuleTags?: string;
    enableTransaction?: boolean;
    disableTagging?: boolean;
    appName?: string;
    effort?: number;
    excludePackages?: string[];
    manuallyAnalyzePackages?: string[];
    excludedPackagesList?: string[];
    openSourceLibraries?: boolean;
    language?: Languages;
    incidents?: {
        mandatory?: number;
        optional?: number;
        potential?: number;
        information?: number;
        total?: number;
    };
    techTags?: string[][];
    ruleFileToQuantity?: { [id: string]: number };
};

export type UserData = {
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    userEnabled: boolean;
    roles?: string[];
};

export type RbacValidationRules = {
    "Create new"?: boolean;
    Analyze?: boolean;
    "Upload binary"?: boolean;
    Import?: boolean;
    "Top action menu"?: {
        "Not available": boolean;
        Import?: boolean;
        "Manage application imports"?: boolean;
        "Manage credentials"?: boolean;
        Delete?: boolean;
    };
    "Application actions"?: {
        Assess?: boolean;
        Review?: boolean;
        "Discard assessment"?: boolean;
        "Discard review"?: boolean;
        Delete?: boolean;
        "Manage dependencies"?: boolean;
        "Manage credentials"?: boolean;
        "Analysis details"?: boolean;
    };
};

export type UpgradeData = {
    jobFunctionName?: string;
    stakeHolderGroupName?: string;
    stakeHolderName?: string;
    businessServiceName?: string;
    tagTypeName?: string;
    tagName?: string;
    sourceControlUsernameCredentialsName?: string;
    sourceApplicationName?: string;
    binaryApplicationName?: string;
    uploadBinaryApplicationName?: string;
    assessmentApplicationName?: string;
    archetypeName?: string;
    importedQuestionnaireAppName?: string;
};

export type RulesRepositoryFields = {
    type: CustomRuleType.Repository;
    repositoryType: RepositoryType;
    repositoryUrl: string;
    branch?: string;
    rootPath?: string;
    credentials?: CredentialsSourceControl;
};

export type RulesManualFields = {
    type: CustomRuleType.Manual;
    rulesetPaths: string[];
};

export type AppIssue = {
    name: string;
    category: string;
    sources: string[];
    targets: string[];
    effort: number;
    totalEffort?: number;
    incidents: number;
    affectedFiles: number;
    tags?: string[];
    ruleSet?: string;
    rule?: string;
    labels?: string[];
};

export type AppDependency = {
    name: string;
    foundIn?: number;
    language: string;
    labels: string[];
    tags?: string[];
};
