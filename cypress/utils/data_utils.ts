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
import { CredentialsData, ProxyData } from "../integration/types/types";
import { CredentialType, UserCredentials } from "../integration/types/constants";
import { writeMavenSettingsFile } from "./utils";

export function getFullName(): string {
    // returns full name made up of first name, last name and title
    return faker.name.findName();
}

export function getEmail(): string {
    // returns a random email address
    return faker.internet.email();
}

export function getCompanyName(): string {
    // returns a random company name
    return faker.company.companyName();
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

export function getRandomDefaultTagType(): string {
    // returns a random tag type from the existing list
    const tagTypes = getDefaultTagTypes();
    return tagTypes[Math.floor(Math.random() * tagTypes.length)];
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

export function getDefaultTagTypes(): string[] {
    return [
        "Application Type",
        "Database",
        "Data Center",
        "Language",
        "Operating System",
        "Runtime",
    ];
}

export function getRandomCredentialsData(
    type: string,
    userCred?: string,
    gitTestingUser?: boolean
): CredentialsData {
    let password;
    let user;

    if (gitTestingUser) {
        user = Cypress.env("git_user");
        password = Cypress.env("git_password");
    } else {
        user = getRandomWord(6);
        password = getRandomWord(6);
    }

    if (type === CredentialType.proxy) {
        return {
            type: type,
            name: getRandomWord(6),
            description: getDescription(),
            username: user,
            password: password,
        };
    }
    if (type === CredentialType.sourceControl) {
        if (userCred === UserCredentials.sourcePrivateKey) {
            return {
                type: type,
                name: getRandomWord(6),
                description: getDescription(),
                key: "app_import/git_ssh_keys",
                passphrase: "",
            };
        } else {
            return {
                type: type,
                name: getRandomWord(6),
                description: getDescription(),
                username: user,
                password: password,
            };
        }
    } else {
        writeMavenSettingsFile(Cypress.env("git_user"), Cypress.env("git_password"));
        return {
            type: type,
            name: getRandomWord(6),
            description: getRandomWord(6),
            settingFile: "xml/settings.xml",
        };
    }
}

export function getRandomProxyData(credentials?: CredentialsData): ProxyData {
    return {
        excludeList: ["127.0.0.1", "cnn.com"],
        credentials: credentials,
        httpEnabled: false,
        hostname: getRandomWord(6),
        port: getRandomNumber().toString(),
        httpsEnabled: true,
    };
}

export function getRealProxyData(credentials?: CredentialsData): ProxyData {
    return {
        excludeList: ["127.0.0.1", "cnn.com"],
        credentials: credentials,
        httpEnabled: false,
        hostname: "rhev-node-12.rdu2.scalelab.redhat.com",
        port: (3128).toString(),
        httpsEnabled: true,
    };
}
