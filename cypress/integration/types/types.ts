import { string } from "@oozcitak/infra";
import { Tag } from "../models/migration/controls/tags";
import { CustomRuleType, RepositoryType } from "../types/constants";
import { CredentialsSourceControl } from "../models/administration/credentials/credentialsSourceControl";

export type CredentialsSourceControlData = {
    type: string;
    name?: string;
    description?: string;
    username?: string;
    password?: string;
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
};

export type CredentialsData =
    | CredentialsProxyData
    | CredentialsSourceControlData
    | CredentialsMavenData
    | CredentialsSourceControlPrivateKeyData;

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
    customRule?: string;
    customRuleRepository?: RulesRepositoryFields;
    sources?: string;
    excludeRuleTags?: string;
    enableTransaction?: boolean;
    enableTagging?: boolean;
    appName?: string;
    storyPoints?: number;
    excludePackages?: string[];
    manuallyAnalyzePackages?: string[];
    excludedPackagesList?: string[];
    openSourceLibraries?: boolean;
    incidents?: {
        mandatory?: number;
        optional?: number;
        potential?: number;
        information?: number;
        total?: number;
    };
    techTags?: string[][];
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
    Assess?: boolean;
    Review?: boolean;
    Import?: boolean;
    "Action menu"?: {
        "Not available": boolean;
        Import?: boolean;
        "Manage imports"?: boolean;
        "Manage credentials"?: boolean;
        Delete?: boolean;
    };
    "analysis applicable options"?: {
        "Analysis details"?: boolean;
        "Cancel analysis"?: boolean;
        "Manage credentials"?: boolean;
        Delete?: boolean;
    };
    "assessment applicable options"?: {
        "Discard assessment"?: boolean;
        "Copy assessment"?: boolean;
        "Manage dependencies"?: boolean;
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
    imagePath?: string;
    rulesetPaths: string[];
};
