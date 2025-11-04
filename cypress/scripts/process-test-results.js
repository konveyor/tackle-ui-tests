#!/usr/bin/env node

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

/**
 * Post-processes Cypress test results to add a "Known Bugs" column to the summary table.
 * This script reads the Mochawesome JSON reports and extracts bug IDs from test titles.
 *
 * Usage: node scripts/process-test-results.js
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
};

function extractBugIds(title) {
    const bugPattern = /Bug\s+(MTA-\d+(?:,\s*MTA-\d+)*)/gi;
    const matches = [];
    let match;

    while ((match = bugPattern.exec(title)) !== null) {
        const bugs = match[1].split(",").map((b) => b.trim());
        matches.push(...bugs);
    }

    return matches;
}

function truncate(str, maxLength) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength - 3) + "...";
    }
    return str;
}

function padRight(str, width) {
    const strValue = String(str);
    // Remove ANSI color codes to calculate the actual visible length
    const visibleLength = strValue.replace(/\x1b\[\d+m/g, "").length;
    const padding = width - visibleLength;
    return strValue + " ".repeat(Math.max(0, padding));
}

function processResults(reportDir) {
    const reportFiles = fs
        .readdirSync(reportDir)
        .filter((file) => file.endsWith(".json") && file.startsWith("mochawesome"));

    if (reportFiles.length === 0) {
        console.log("No Mochawesome JSON reports found in", reportDir);
        return;
    }

    const specStats = [];
    let totalTests = 0;
    let totalPasses = 0;
    let totalFailures = 0;
    let totalPending = 0;
    let totalSkipped = 0;
    const allKnownBugs = new Set();

    reportFiles.forEach((file) => {
        const reportPath = path.join(reportDir, file);
        const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

        if (!report.results || report.results.length === 0) return;

        report.results.forEach((suite) => {
            const specName = suite.file || "Unknown";
            const knownBugs = new Set();

            let tests = 0;
            let passes = 0;
            let failures = 0;
            let pending = 0;

            function processSuite(s) {
                if (s.tests) {
                    s.tests.forEach((test) => {
                        tests++;
                        if (test.pass) passes++;
                        if (test.fail) failures++;
                        if (test.pending) pending++;

                        const bugs = extractBugIds(test.title);
                        bugs.forEach((bug) => {
                            knownBugs.add(bug);
                            allKnownBugs.add(bug);
                        });
                    });
                }

                if (s.suites) {
                    s.suites.forEach(processSuite);
                }
            }

            suite.suites.forEach(processSuite);

            totalTests += tests;
            totalPasses += passes;
            totalFailures += failures;
            totalPending += pending;

            specStats.push({
                spec: specName,
                tests,
                passes,
                failures,
                pending,
                skipped: 0,
                knownBugs: Array.from(knownBugs),
                duration: suite.duration || 0,
            });
        });
    });

    printSummaryTable(
        specStats,
        totalTests,
        totalPasses,
        totalFailures,
        totalPending,
        totalSkipped,
        allKnownBugs
    );
}

function printSummaryTable(
    specStats,
    totalTests,
    totalPasses,
    totalFailures,
    totalPending,
    totalSkipped,
    allKnownBugs
) {
    console.log("\n");

    const colWidths = {
        spec: 45,
        tests: 7,
        passing: 8,
        failing: 8,
        pending: 8,
        skipped: 8,
        bugCount: 10,
        bugIds: 25,
    };

    const totalWidth =
        colWidths.spec +
        colWidths.tests +
        colWidths.passing +
        colWidths.failing +
        colWidths.pending +
        colWidths.skipped +
        colWidths.bugCount +
        colWidths.bugIds +
        16; // spacing and borders

    // Header
    console.log("  ┌" + "─".repeat(totalWidth - 2) + "┐");
    const header =
        "│ " +
        padRight("Spec", colWidths.spec) +
        padRight("Tests", colWidths.tests) +
        padRight("Passing", colWidths.passing) +
        padRight("Failing", colWidths.failing) +
        padRight("Pending", colWidths.pending) +
        padRight("Skipped", colWidths.skipped) +
        padRight("Bug Count", colWidths.bugCount) +
        padRight("Bug_IDs", colWidths.bugIds) +
        "│";

    console.log("  " + header);
    console.log("  ├" + "─".repeat(totalWidth - 2) + "┤");

    // Rows for each spec
    specStats.forEach((stats) => {
        const shortSpec = truncate(stats.spec.split("/").pop() || stats.spec, colWidths.spec - 2);
        const status = stats.failures > 0 ? "✖" : "✔";
        const statusColor = stats.failures > 0 ? colors.red : colors.green;

        const bugCount = stats.knownBugs.length > 0 ? stats.knownBugs.length : "-";
        const knownBugsStr = stats.knownBugs.length > 0 ? stats.knownBugs.join(", ") : "-";
        const duration = stats.duration ? `${Math.round(stats.duration)}ms` : "0ms";

        const row =
            "│ " +
            statusColor +
            status +
            colors.reset +
            "  " +
            padRight(truncate(shortSpec, colWidths.spec - 4), colWidths.spec - 4) +
            padRight(String(stats.tests || "-"), colWidths.tests) +
            padRight(String(stats.passes || "-"), colWidths.passing) +
            padRight(String(stats.failures || "-"), colWidths.failing) +
            padRight(String(stats.pending || "-"), colWidths.pending) +
            padRight(String(stats.skipped || "-"), colWidths.skipped) +
            padRight(String(bugCount), colWidths.bugCount) +
            padRight(truncate(knownBugsStr, colWidths.bugIds), colWidths.bugIds) +
            "│";

        console.log("  " + row);
    });

    console.log("  ├" + "─".repeat(totalWidth - 2) + "┤");

    // Summary footer
    const summaryStatus = totalFailures > 0 ? "✖" : "✔";
    const summaryColor = totalFailures > 0 ? colors.red : colors.green;

    const totalBugCount = allKnownBugs.size > 0 ? allKnownBugs.size : "-";

    // Create summary text based on pass/fail status
    let summaryText;
    if (totalFailures > 0) {
        const percentage = Math.round((totalFailures / totalTests) * 100);
        summaryText = `${totalFailures} of ${totalTests} failed (${percentage}%)`;
    } else {
        summaryText = `All tests passing`;
    }

    const summaryFailingStr =
        totalFailures > 0
            ? colors.red + String(totalFailures) + colors.reset
            : String(totalFailures || "-");
    const summaryBugCountStr =
        allKnownBugs.size > 0
            ? colors.red + String(totalBugCount) + colors.reset
            : String(totalBugCount);

    const summaryRow =
        "│ " +
        summaryColor +
        summaryStatus +
        colors.reset +
        "  " +
        padRight(summaryText, colWidths.spec - 4) +
        padRight(String(totalTests || "-"), colWidths.tests) +
        padRight(String(totalPasses || "-"), colWidths.passing) +
        padRight(summaryFailingStr, colWidths.failing) +
        padRight(String(totalPending || "-"), colWidths.pending) +
        padRight(String(totalSkipped || "-"), colWidths.skipped) +
        padRight(summaryBugCountStr, colWidths.bugCount) +
        padRight("-", colWidths.bugIds) +
        "│";

    console.log("  " + summaryRow);
    console.log("  └" + "─".repeat(totalWidth - 2) + "┘");

    // Print all known bugs
    if (allKnownBugs.size > 0) {
        console.log(
            "\n  " +
                colors.yellow +
                `Known Bugs (${allKnownBugs.size}): ` +
                colors.reset +
                Array.from(allKnownBugs).join(", ")
        );
    }

    console.log("\n");
}

// Main execution
const reportDir = process.argv[2] || path.join(__dirname, "..", "cypress", "reports");

if (!fs.existsSync(reportDir)) {
    console.error(`Report directory not found: ${reportDir}`);
    process.exit(1);
}

processResults(reportDir);
