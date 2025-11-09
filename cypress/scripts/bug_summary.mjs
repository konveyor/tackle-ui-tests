#!/usr/bin/env node
import { merge } from "mochawesome-merge";
import { table } from "table";

const bugPattern = /Bug\s+([A-Z]+-\d+)/i;
const fileArg = process.argv[2] || "cypress/reports/.jsons/*.json";

const red = (text) => `\x1b[31m${text}\x1b[0m`;
const SPEC_COL_WIDTH = 35;

let json;
try {
    json = await merge({ files: [fileArg] });
} catch {
    console.warn("⚠️  No JSON report files found to merge.");
    json = { results: [] };
}

const specs = {};

json.results.forEach((result) => {
    let specName = result.file ?? "unknown";
    specName = specName.replace(/^cypress\/e2e\/tests\//, "");
    specs[specName] ||= { total: 0, passing: 0, failing: 0, pending: 0, skipped: 0, bugs: [] };

    (result.suites || []).forEach((suite) => {
        (suite.tests || []).forEach((t) => {
            const s = specs[specName];
            s.total++;

            const bugMatch = t.title.match(bugPattern);
            if (bugMatch) s.bugs.push(bugMatch[1]);

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

Object.keys(specs)
    .sort()
    .forEach((spec) => {
        const s = specs[spec];
        const bugList = s.bugs.length ? s.bugs : ["-"];

        rows.push([
            spec,
            s.total,
            s.passing,
            s.failing > 0 ? red(s.failing) : s.failing,
            s.pending,
            s.skipped,
            s.bugs.length > 0 ? red(s.bugs.length) : s.bugs.length,
            bugList.join("\n"),
        ]);
    });

const totalTests = Object.values(specs).reduce((a, s) => a + s.total, 0);
const totalPassed = Object.values(specs).reduce((a, s) => a + s.passing, 0);
const totalFailed = Object.values(specs).reduce((a, s) => a + s.failing, 0);
const totalPending = Object.values(specs).reduce((a, s) => a + s.pending, 0);
const totalSkipped = Object.values(specs).reduce((a, s) => a + s.skipped, 0);
const totalBugs = Object.values(specs).reduce((a, s) => a + s.bugs.length, 0);
const percentFailed = totalTests ? Math.round((totalFailed / totalTests) * 100) : 0;

rows.push([
    totalFailed > 0
        ? red(`✖ ${totalFailed} of ${totalTests} failed (${percentFailed}%)`)
        : `✓ ${totalTests} tests passed`,
    totalTests,
    totalPassed,
    totalFailed > 0 ? red(totalFailed) : totalFailed,
    totalPending,
    totalSkipped,
    totalBugs > 0 ? red(totalBugs) : totalBugs,
    "-",
]);

const output = table(rows, {
    columns: {
        0: { wrapWord: true, width: SPEC_COL_WIDTH },
        7: { wrapWord: true, width: 22 },
    },
    drawHorizontalLine: () => true,
});

console.log(output);
