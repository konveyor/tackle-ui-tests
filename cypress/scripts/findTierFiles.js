#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Read tier tags from CLI argument
const tierArg = process.argv[2];
if (!tierArg) {
    console.error("Usage: node findTierFiles.js <tierTag1,tierTag2,...>");
    process.exit(1);
}

// Split multiple tiers
const tierTags = tierArg.split(",").map((t) => t.trim());

const rootDir = path.resolve("cypress/e2e/tests");

function getAllTestFiles(dir) {
    let results = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach((item) => {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) results = results.concat(getAllTestFiles(fullPath));
        else if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) results.push(fullPath);
    });
    return results;
}

// Check if file contains any of the tier tags
function fileContainsAnyTier(file, tags) {
    const content = fs.readFileSync(file, "utf-8").split("\n").slice(0, 50).join("\n"); // only scan first 50 lines
    return tags.some((tag) => new RegExp(`@${tag}\\b`, "i").test(content));
}

const allFiles = getAllTestFiles(rootDir);
const tierFiles = allFiles.filter((file) => fileContainsAnyTier(file, tierTags));

console.log(tierFiles.join(","));
