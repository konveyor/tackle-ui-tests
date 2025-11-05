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

const Mocha = require("mocha");
const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
} = Mocha.Runner.constants;

const { inherits } = require("mocha/lib/utils");
const Base = Mocha.reporters.Base;
const color = Base.color;
const cursor = Base.cursor;

/**
 * Custom Cypress reporter that extends the spec reporter to include a "Known Bugs" column
 * This reporter tracks Bug IDs mentioned in test titles (e.g., "Bug MTA-1234")
 */
function CustomSpecReporter(runner, options) {
    Base.call(this, runner, options);

    const self = this;
    let indents = 0;
    let n = 0;

    // Track stats per spec file
    const specStats = new Map();
    let currentSpec = null;

    function indent() {
        return Array(indents).join("  ");
    }

    // Extract bug IDs from test title
    function extractBugIds(title) {
        const bugPattern = /Bug\s+(MTA-\d+(?:,\s*MTA-\d+)*)/gi;
        const matches = [];
        let match;

        while ((match = bugPattern.exec(title)) !== null) {
            // Split on commas and trim to handle "Bug MTA-1234, MTA-5678"
            const bugs = match[1].split(",").map((b) => b.trim());
            matches.push(...bugs);
        }

        return matches.length > 0 ? matches : [];
    }

    runner.on(EVENT_RUN_BEGIN, function () {
        Base.consoleLog();
    });

    runner.on(EVENT_SUITE_BEGIN, function (suite) {
        // Track the spec file
        if (suite.file && !currentSpec) {
            currentSpec = suite.file;
            if (!specStats.has(currentSpec)) {
                specStats.set(currentSpec, {
                    tests: 0,
                    passes: 0,
                    failures: 0,
                    pending: 0,
                    skipped: 0,
                    knownBugs: new Set(),
                });
            }
        }
        ++indents;
        // Suppress suite output to avoid duplicate
        // Base.consoleLog(color("suite", "%s%s"), indent(), suite.title);
    });

    runner.on(EVENT_SUITE_END, function () {
        --indents;
        // Suppress suite end output
        // if (indents === 1) {
        //     Base.consoleLog();
        // }
    });

    runner.on(EVENT_TEST_PASS, function (test) {
        const stats = specStats.get(currentSpec);
        if (stats) {
            stats.tests++;
            stats.passes++;

            // Extract bug IDs from test title
            const bugs = extractBugIds(test.title);
            bugs.forEach((bug) => stats.knownBugs.add(bug));
        }

        // Suppress individual test output to avoid duplicate
        // const fmt = indent() + color("checkmark", "  " + Base.symbols.ok) + color("pass", " %s");
        // cursor.CR();
        // Base.consoleLog(fmt, test.title);
    });

    runner.on(EVENT_TEST_FAIL, function (test) {
        const stats = specStats.get(currentSpec);
        if (stats) {
            stats.tests++;
            stats.failures++;

            // Extract bug IDs from test title
            const bugs = extractBugIds(test.title);
            bugs.forEach((bug) => stats.knownBugs.add(bug));
        }

        // Suppress individual test output to avoid duplicate
        // cursor.CR();
        // Base.consoleLog(indent() + color("fail", "  %d) %s"), ++n, test.title);
    });

    runner.on(EVENT_RUN_END, function () {
        // Don't call self.epilogue() to avoid duplicate output
        printSpecTable(specStats, self.stats);
    });

    // Print the spec summary table with Known Bugs column
    function printSpecTable(specStats, totalStats) {
        Base.consoleLog();
        Base.consoleLog();

        const maxSpecLength = 45;
        const colWidths = {
            spec: maxSpecLength,
            tests: 9,
            passing: 10,
            failing: 10,
            pending: 10,
            skipped: 10,
            bugCount: 12,
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
            8; // spacing

        // Header
        const header =
            padRight("Spec", colWidths.spec) +
            padRight("Tests", colWidths.tests) +
            padRight("Passing", colWidths.passing) +
            padRight("Failing", colWidths.failing) +
            padRight("Pending", colWidths.pending) +
            padRight("Skipped", colWidths.skipped) +
            padRight("Bug Count", colWidths.bugCount) +
            padRight("Bug_IDs", colWidths.bugIds);

        Base.consoleLog("  " + header);
        Base.consoleLog("  " + "─".repeat(totalWidth));

        // Rows for each spec
        specStats.forEach((stats, specFile) => {
            const shortSpec = truncateSpec(specFile, maxSpecLength - 4);
            const status = stats.failures > 0 ? "✖" : "✔";
            const statusColor = stats.failures > 0 ? "fail" : "checkmark";

            const bugCount = stats.knownBugs.size > 0 ? stats.knownBugs.size : "-";
            const knownBugsStr =
                stats.knownBugs.size > 0 ? Array.from(stats.knownBugs).join(", ") : "-";

            // Wrap bug IDs if they're too long
            const wrappedBugLines = wrapText(knownBugsStr, colWidths.bugIds);

            // Print first line with all columns
            const failingStr =
                stats.failures > 0
                    ? color("fail", String(stats.failures))
                    : String(stats.failures || "-");
            const bugCountStr =
                stats.knownBugs.size > 0 ? color("fail", String(bugCount)) : String(bugCount);

            const row =
                "│ " +
                color(statusColor, status) +
                "  " +
                padRight(shortSpec, colWidths.spec - 4) +
                padRight(String(stats.tests || "-"), colWidths.tests) +
                padRight(String(stats.passes || "-"), colWidths.passing) +
                padRight(failingStr, colWidths.failing) +
                padRight(String(stats.pending || "-"), colWidths.pending) +
                padRight(String(stats.skipped || "-"), colWidths.skipped) +
                padRight(bugCountStr, colWidths.bugCount) +
                padRight(wrappedBugLines[0] || "-", colWidths.bugIds) +
                "│";

            Base.consoleLog("  " + row);

            // Print continuation lines for wrapped bug IDs (if any)
            for (let i = 1; i < wrappedBugLines.length; i++) {
                const continuationRow =
                    "│ " +
                    " ".repeat(colWidths.spec + 2) + // Empty space for status + spec column
                    padRight("", colWidths.tests) +
                    padRight("", colWidths.passing) +
                    padRight("", colWidths.failing) +
                    padRight("", colWidths.pending) +
                    padRight("", colWidths.skipped) +
                    padRight("", colWidths.bugCount) +
                    padRight(wrappedBugLines[i], colWidths.bugIds) +
                    "│";
                Base.consoleLog("  " + continuationRow);
            }
        });

        Base.consoleLog("  " + "─".repeat(totalWidth));

        // Summary footer
        const totalBugs = new Set();
        specStats.forEach((stats) => {
            stats.knownBugs.forEach((bug) => totalBugs.add(bug));
        });

        const summaryStatus = totalStats.failures > 0 ? "✖" : "✔";
        const summaryColor = totalStats.failures > 0 ? "fail" : "checkmark";

        const totalBugCount = totalBugs.size > 0 ? totalBugs.size : "-";

        // Create summary text based on pass/fail status
        let summaryText;
        if (totalStats.failures > 0) {
            const percentage = Math.round((totalStats.failures / totalStats.tests) * 100);
            summaryText = `${totalStats.failures} of ${totalStats.tests} failed (${percentage}%)`;
        } else {
            summaryText = `All tests passing`;
        }

        const summaryFailingStr =
            totalStats.failures > 0
                ? color("fail", String(totalStats.failures))
                : String(totalStats.failures || "-");
        const summaryBugCountStr =
            totalBugs.size > 0 ? color("fail", String(totalBugCount)) : String(totalBugCount);

        const summaryRow =
            "│ " +
            color(summaryColor, summaryStatus) +
            "  " +
            padRight(summaryText, colWidths.spec - 4) +
            padRight(String(totalStats.tests || "-"), colWidths.tests) +
            padRight(String(totalStats.passes || "-"), colWidths.passing) +
            padRight(summaryFailingStr, colWidths.failing) +
            padRight(String(totalStats.pending || "-"), colWidths.pending) +
            padRight("-", colWidths.skipped) +
            padRight(summaryBugCountStr, colWidths.bugCount) +
            padRight("-", colWidths.bugIds) +
            "│";

        Base.consoleLog("  " + summaryRow);

        Base.consoleLog("  " + "└" + "─".repeat(totalWidth - 2) + "┘");
        Base.consoleLog();
    }

    function truncateSpec(spec, maxLength) {
        const parts = spec.split("/");
        let result = parts[parts.length - 1];

        if (result.length > maxLength) {
            result = result.substring(0, maxLength - 3) + "...";
        }

        return result;
    }

    function truncate(str, maxLength) {
        if (str.length > maxLength) {
            return str.substring(0, maxLength - 3) + "...";
        }
        return str;
    }

    function wrapText(text, maxWidth) {
        if (text === "-") {
            return [text];
        }

        // Split bug IDs and put one per line
        const parts = text.split(", ");
        return parts.length > 0 ? parts : [text];
    }

    function padRight(str, width) {
        const strValue = String(str);
        // Remove ANSI color codes to calculate the actual visible length
        const visibleLength = strValue.replace(/\u001b\[\d+m/g, "").length;
        const padding = width - visibleLength;
        return strValue + " ".repeat(Math.max(0, padding));
    }
}

// Inherit from Base reporter
inherits(CustomSpecReporter, Base);

module.exports = CustomSpecReporter;
