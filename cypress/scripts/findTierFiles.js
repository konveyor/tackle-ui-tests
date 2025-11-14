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
    return fs.globSync("**/*.{ts,js}", { cwd: dir }).map((file) => path.join(dir, file));
}

function fileContainsAnyTier(file, tags) {
    const content = fs.readFileSync(file, "utf-8");
    return tags.some((tag) => new RegExp(`@${tag}\\b`, "i").test(content));
}

const allFiles = getAllTestFiles(rootDir);
const tierFiles = allFiles.filter((file) => fileContainsAnyTier(file, tierTags));

console.log(tierFiles.join(","));
