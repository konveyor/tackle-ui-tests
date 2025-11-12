#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const tierTag = process.argv[2];
if (!tierTag) {
    console.error("Usage: node findTierFiles.js <tierTag>");
    process.exit(1);
}

const rootDir = path.resolve("cypress/e2e/tests");

function getAllTestFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });

    list.forEach((item) => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results = results.concat(getAllTestFiles(fullPath));
        } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) {
            results.push(fullPath);
        }
    });

    return results;
}

const allFiles = getAllTestFiles(rootDir);
const tierFiles = allFiles.filter((file) => {
    const content = fs.readFileSync(file, "utf-8");
    return content.includes(tierTag);
});

console.log(tierFiles.join(","));
