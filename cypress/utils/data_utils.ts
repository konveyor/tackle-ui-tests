import * as faker from "faker";

export function getStakeholderName(): string {
    return faker.name.findName();
}

export function getStakeholderEmail(): string {
    return faker.internet.email();
}

export function getBusinessServiceName(): string {
    return faker.company.companyName();
}

export function getBusinessServiceDescription(): string {
    return faker.lorem.sentence();
}

export function getLongString(): string {
    return faker.random.words(75);
}
