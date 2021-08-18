import * as faker from "faker";

function generate_random_string(string_length) {
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii)
    }
    return random_string
}


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
    return getRandomWords(1) + faker.lorem.word(charLength);
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
    let app_name = "test-app-" + generate_random_string(8) + "-" + random_word;
    return app_name;
}

export function getRandomRisk(): string {
    // returns a random tag type from the existing list
    const risk = [
        "high",
        "medium",
        "low"
    ];
    return risk[Math.floor(Math.random() * risk.length)];
}