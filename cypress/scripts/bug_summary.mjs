#!/usr/bin/env node
import { merge } from "mochawesome-merge";
import { table } from "table";

const bugPattern = /Bug\s+([A-Z]+-\d+)/i;
const fileArg = process.argv[2] || "cypress/reports/.jsons/*.json";

// ANSI colors
const red = (text) => `\x1b[31m${text}\x1b[0m`;

let json;
try {
    json = await merge({ files: [fileArg] });
} catch {
    console.warn("⚠️  No JSON report files found to merge.");
    json = { results: [] };
}

const specs = {};

json.results.forEach((result) => {
    const specName = result.file?.split("/").pop() ?? "unknown";
    specs[specName] ||= { total: 0, passing: 0, failing: 0, pending: 0, skipped: 0, bugs: [] };

    result.suites.forEach((suite) => {
        suite.tests.forEach((t) => {
            const s = specs[specName];
            s.total++;
            if (bugPattern.test(t.title)) {
                const bugId = t.title.match(bugPattern)[1];
                s.bugs.push(bugId);
            }
            switch (t.state) {
                case "passed":
                    s.passing++;
                    break;
                case "failed":
                    s.failing++;
                    break;
                case "pending":
                    s.pending++;
                    break;
                case "skipped":
                    s.skipped++;
                    break;
            }
        });
    });
});

const rows = [
    ["Spec", "Tests", "Passing", "Failing", "Pending", "Skipped", "Bug Count", "Bug IDs"],
];

const sortedSpecs = Object.keys(specs).sort();
sortedSpecs.forEach((spec) => {
    const s = specs[spec];
    if (s.bugs.length) {
        s.bugs.forEach((b, i) => {
            rows.push([
                i === 0 ? spec : "",
                i === 0 ? s.total : "",
                i === 0 ? s.passing : "",
                i === 0 ? red(s.failing) : "",
                i === 0 ? s.pending : "",
                i === 0 ? s.skipped : "",
                i === 0 ? red(s.bugs.length) : "",
                b,
            ]);
        });
    } else {
        rows.push([
            spec,
            s.total,
            s.passing,
            red(s.failing),
            s.pending,
            s.skipped,
            red(s.bugs.length),
            "-",
        ]);
    }
});

// Aggregate row
const totalTests = Object.values(specs).reduce((a, s) => a + s.total, 0);
const totalPassed = Object.values(specs).reduce((a, s) => a + s.passing, 0);
const totalFailed = Object.values(specs).reduce((a, s) => a + s.failing, 0);
const totalPending = Object.values(specs).reduce((a, s) => a + s.pending, 0);
const totalSkipped = Object.values(specs).reduce((a, s) => a + s.skipped, 0);
const totalBugs = Object.values(specs).reduce((a, s) => a + s.bugs.length, 0);
const percentFailed = totalTests ? Math.round((totalFailed / totalTests) * 100) : 0;

rows.push([
    red(`✖ ${totalFailed} of ${totalTests} failed (${percentFailed}%)`),
    "",
    totalPassed,
    red(totalFailed),
    totalPending,
    totalSkipped,
    red(totalBugs),
    "-",
]);

console.log(table(rows));
