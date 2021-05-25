import * as faker from "faker";

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
    // returns a sentence with default word count randomly in between 3 to 10
    return faker.lorem.sentence();
}

export function getJobTitle(): string {
    // returns a random job title related to any job area (like Marketing, Accounts etc.)
    return faker.name.jobArea();
}

export function getRandomWord(charLength: number): string {
    // returns a word of specified charLength
    return faker.lorem.word(charLength);
}

export function getRandomWords(numberOfWords: number): string {
    // returns random words separated by space
    return faker.lorem.words(numberOfWords);
}

export function getRandomNumber(): string {
    // returns a random number
    return faker.datatype.number();
}
