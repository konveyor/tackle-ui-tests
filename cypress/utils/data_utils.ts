import * as faker from "faker";

export function getFullName(): string {
    return faker.name.findName();
}

export function getEmail(): string {
    return faker.internet.email();
}

export function getCompanyName(): string {
    return faker.company.companyName();
}

export function getSentence(): string {
    return faker.lorem.sentence();
}

export function getJobTitle(): string {
    return faker.name.jobType();
}

export function getRandomWord(length: number): string {
    return faker.lorem.word(length);
}

export function getRandomWords(length: number): string {
    return faker.lorem.words(length);
}
