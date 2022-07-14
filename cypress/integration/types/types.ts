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
    settingFile?: string;
};

export type CredentialsData =
    | CredentialsProxyData
    | CredentialsSourceControlData
    | CredentialsMavenData;
