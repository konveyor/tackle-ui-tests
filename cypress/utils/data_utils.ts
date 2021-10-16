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

export function getExistingTagtype(): string {
    // returns a random tag type from the existing list
    const tagtypes = [
        "Application Type",
        "Database",
        "Data Center",
        "Language",
        "Operating System",
        "Runtime",
    ];
    return tagtypes[Math.floor(Math.random() * tagtypes.length)];
}

export function getAppName(): string {
    // returns a new random application name
    let random_word = getRandomWords(1);
    let app_name = "test-app-" + random_word;
    return app_name;
}

export function randomWordGenerator(length: number): string {
    var generatedWord = "";
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

export function getExistingTagtypes(): string[] {
    const tagtypes = [
        "Application Type",
        "Database",
        "Data Center",
        "Language",
        "Operating System",
        "Runtime",
    ];
    return tagtypes;
}
