import { string } from "@oozcitak/infra";
import { Tag } from "../models/developer/controls/tags";

export type CredentialsSourceControlData = {
    type: string;
    name?: string;
    description?: string;
    username?: string;
    password?: string;
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
    | CredentialsMavenData;

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
    target: string;
    binary?: string;
    scope?: string;
    customRule?: string;
    sources?: string;
    excludeRuleTags?: string;
    enableTransaction?: boolean;
};
