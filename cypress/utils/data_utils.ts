import * as faker from "faker";

export function getStakeholderName(): string {
    return faker.name.findName();
}

export function getStakeholderEmail(): string {
    return faker.internet.email();
}

export function getStakeholdergroupName(): string {
    return faker.company.companyName();
}

export function getStakeholdergroupDescription(): string {
    return faker.lorem.sentence();
}

export function getJobFuncName(): string {
    return faker.name.jobType();
}

export function getRandomWord(length: number): string {
    return faker.lorem.word(length);
}

export function getRandomWords(length: number): string {
    return faker.lorem.words(length);
export function getBusinessServiceName(): string {
    return faker.company.companyName();
}

export function getBusinessServiceDescription(): string {
    return faker.lorem.sentence();
}

export function getLongString(): string {
    return faker.random.words(75);
}
