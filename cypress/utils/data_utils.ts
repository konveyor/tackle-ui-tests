/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as faker from "faker";
import { JiraCredentials } from "../e2e/models/administration/credentials/JiraCredentials";
import { CredentialType, CustomRuleType, JiraType, UserCredentials } from "../e2e/types/constants";
import {
    CredentialsData,
    CredentialsJiraData,
    JiraConnectionData,
    ProxyData,
    RulesManualFields,
    RulesRepositoryFields,
    UserData,
} from "../e2e/types/types";
import { writeGpgKey, writeMavenSettingsFile } from "./utils";

export function getFullName(): string {
    // returns full name made up of first name, last name and title
    return faker.name.findName().trim();
}

export function getEmail(): string {
    // returns a random email address
    return faker.internet.email();
}

export function getCompanyName(): string {
    // returns a random company name
    return faker.company.companyName().trim();
}

export function getDescription(): string {
    // returns a sentence with default word count randomly in between 3 and 10
    return faker.lorem.sentence();
}

export function getJobTitle(): string {
    // returns a random job title related to any job area (like Marketing, Accounts etc.)
    return randomWordGenerator(6);
}

export function getRandomWord(charLength: number): string {
    // returns a word of specified charLength
    return randomWordGenerator(charLength);
}

export function getRandomWords(numberOfWords: number): string {
    // returns random words separated by space
    return faker.lorem.words(numberOfWords);
}

export function getRandomNumber(min = 1111, max = 5555): number {
    // returns a random number between range min to max
    return Math.floor(Math.random() * (max - min) + min);
}

export function getColor(): string {
    // returns a random color from the fixed set of available colors
    const colors = ["Blue", "Cyan", "Green", "Orange", "Purple", "Red"];
    return colors[Math.floor(Math.random() * colors.length)];
}

export function getRandomDefaultTagCategory(): string {
    // returns a random tag type from the existing list
    const tagCategories = getDefaultTagCategories();
    return tagCategories[Math.floor(Math.random() * tagCategories.length)];
}

export function getAppName(): string {
    // returns a new random application name
    let random_word = getRandomWords(1);
    let random_num = getRandomNumber(1, 200);
    return "test-app-" + random_word + random_num;
}

export function randomWordGenerator(length: number): string {
    let generatedWord = "";
    const charsToUse = "aAbBcCdDeEfFgGhHiIjJkKlLmNnoOpPqQrRsStTuUvVwWxXyYzZ";
    for (let i = 0; i < length; i++) {
        generatedWord += charsToUse.charAt(Math.floor(Math.random() * charsToUse.length));
    }
    return generatedWord;
}

export function getRandomRisk(): string {
    // returns a random tag type from the existing list
    const risk = ["high", "medium", "low"];
    return risk[Math.floor(Math.random() * risk.length)];
}

export function getDefaultTagCategories(): string[] {
    return [
        "Application Type",
        "Database",
        "Data Center",
        "Language",
        "Operating System",
        "Runtime",
    ];
}
/**
 * Generates random URL
 *
 * @param length length of URL between "https://" and domain ".com"
 */
export function getRandomUrl(length = 6): string {
    return "https://" + getRandomWord(length).toLowerCase() + ".com";
}

/**
 * Generates credentials of defined type and sends it back
 *
 * @param type is type of credentials to be generated.
 * @param userCred defines type of source credentials. Optional.
 * @param useTestingAccount defines if returned user credentials are random (when false) or real test user (when true)
 * @param url is used for Maven credentials type. Optional.
 * @returns CredentialsData of selected type.
 */
export function getRandomCredentialsData(
    type: string,
    userCred?: string,
    useTestingAccount = false,
    url?: string
): CredentialsData {
    let password = getRandomWord(6);
    let user = getRandomWord(6);
    let email = getEmail();
    //TODO: This value is set to 20 to avoid a bug https://issues.redhat.com/browse/MTA-717. Need to be updated to 200 when bug is fixed
    let token = getRandomWord(20);
    let key = getRandomWord(20);

    if (type === CredentialType.proxy) {
        if (useTestingAccount) {
            user = "redhat";
            password = "redhat";
        }
        return {
            type: type,
            name: getRandomWord(6),
            description: getDescription(),
            username: user,
            password: password,
        };
    }

    if (type === CredentialType.jiraBasic) {
        if (useTestingAccount) {
            email = Cypress.env("jira_atlassian_cloud_email");
            token = Cypress.env("jira_atlassian_cloud_token");
        }
        return {
            type: type,
            name: getRandomWord(6),
            description: getDescription(),
            email: email,
            token: token,
        };
    }

    if (type === CredentialType.jiraToken) {
        if (useTestingAccount) {
            key = Cypress.env("jira_stage_bearer_token");
        }
        return {
            type: type,
            name: getRandomWord(6),
            description: getDescription(),
            key: key,
        };
    }

    if (type === CredentialType.sourceControl) {
        if (userCred === UserCredentials.sourcePrivateKey) {
            // Source control - gpg key and passphrase
            if (Cypress.env("git_key")) writeGpgKey(Cypress.env("git_key"));
            return {
                type: type,
                name: getRandomWord(6),
                description: getDescription(),
                key: "gpgkey",
                passphrase: getRandomWord(6),
            };
        } else {
            // Source Control - username and password
            if (useTestingAccount) {
                user = Cypress.env("git_user");
                if (!user) {
                    user = getRandomWord(6);
                    cy.log("No user specified, using generated user", user);
                }
                password = Cypress.env("git_password");
                if (!password) {
                    password = getRandomWord(8);
                    cy.log("No password specified, using generated password");
                }
            }
            return {
                type: type,
                name: getRandomWord(6),
                description: getDescription(),
                username: user,
                password: password,
            };
        }
    } else {
        // Maven credentials
        if (useTestingAccount) {
            writeMavenSettingsFile(Cypress.env("git_user"), Cypress.env("git_password"), url);
        }
        return {
            type: type,
            name: getRandomWord(6),
            description: getRandomWord(6),
            settingFile: "xml/settings.xml",
        };
    }
}

/**
 * This function returns JiraConnectionData
 *
 * @param jiraCredential credential used to build Jira connection. Can be either JiraCredentialsBasic or JiraCredentialsBearer
 * @param jiraType is type of Jira account that should be returned
 * @param isInsecure if true - selfsigned certificates will be accepted
 * @param useTestingAccount if true - real connection data will be used, otherwise dummy data will be added
 *
 */
export function getJiraConnectionData(
    jiraCredential: JiraCredentials,
    jiraType = JiraType.cloud,
    isInsecure?: boolean,
    useTestingAccount = false
): JiraConnectionData {
    let url = getRandomUrl(6);
    let type = jiraType;

    if (useTestingAccount) {
        url =
            type === JiraType.cloud
                ? Cypress.env("jira_atlassian_cloud_url")
                : Cypress.env("jira_stage_datacenter_url");
    }

    return {
        credential: jiraCredential,
        isInsecure: isInsecure,
        name: "Jira_" + getRandomWord(5),
        type: type,
        url: url,
    };
}

/**
 * This function returns Jira credentials, either JiraCredentialsBasic or JiraCredentialsBearer
 *
 * @param accountType Type of account, it can be Cloud or Datacenter/Server
 * @param useTestingAccount if true - real credential data will be used, otherwise dummy data will be added
 * @param isStage should be `true` when using Stage Jira and false when using Cloud Jira
 *
 */
export function getJiraCredentialData(
    accountType: string,
    useTestingAccount = false,
    isStage = false
): CredentialsJiraData {
    let accountName = "Jira_" + getRandomWord(6);
    let description = getDescription();
    let email = getEmail();
    let token = getRandomWord(20);

    if (useTestingAccount) {
        if (accountType === CredentialType.jiraBasic) {
            if (!isStage) {
                email = Cypress.env("jira_atlassian_cloud_email");
                token = Cypress.env("jira_atlassian_cloud_token");
            } else {
                email = Cypress.env("jira_stage_basic_login");
                token = Cypress.env("jira_stage_basic_password");
            }
        } else {
            // email field not present for bearer auth
            email = null;
            token = Cypress.env("jira_stage_bearer_token");
        }
    }
    return {
        type: accountType,
        name: accountName,
        description: description,
        email: email,
        token: token,
    };
}

export function getRandomProxyData(credentials?: CredentialsData): ProxyData {
    return {
        excludeList: ["127.0.0.1", "cnn.com", getRandomWord(6)],
        credentials: credentials,
        httpEnabled: false,
        hostname: getRandomWord(6),
        port: getRandomNumber().toString(),
        httpsEnabled: true,
    };
}

export function getRandomUserData(): UserData {
    let fullName = getFullName();
    let firstName = fullName.split(" ")[0];
    let lastName = fullName.split(" ")[1];
    return {
        username: firstName.toLowerCase(),
        password: getRandomWord(6),
        firstName: firstName,
        lastName: lastName,
        email: getEmail(),
        userEnabled: true,
    };
}

export function getRulesData(targetData): RulesRepositoryFields | RulesManualFields {
    if (targetData.repository) {
        return {
            ...targetData.repository,
            type: CustomRuleType.Repository,
        };
    }

    return {
        type: CustomRuleType.Manual,
        rulesetPaths: targetData.rulesFiles,
    };
}
