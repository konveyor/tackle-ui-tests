import { merge } from "mochawesome-merge";
import { table } from "table";

const bugPattern = /Bug\s+([A-Z]+-\d+)/i;
const filePattern = process.argv[2] || "cypress/reports/.jsons/*.json";

// ANSI colors
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;

async function run() {
    const json = await merge({ files: [filePattern] });

    const specs = {};
    let totalTests = 0,
        totalPassing = 0,
        totalFailing = 0,
        totalPending = 0,
        totalSkipped = 0,
        totalBugs = 0;

    json.results.forEach((result) => {
        const specName = result.file?.split("/").pop() ?? "unknown";
        specs[specName] ||= { total: 0, passing: 0, failing: 0, pending: 0, skipped: 0, bugs: [] };

        result.suites.forEach((suite) => {
            suite.tests.forEach((t) => {
                const s = specs[specName];
                s.total++;
                totalTests++;

                if (bugPattern.test(t.title)) {
                    const bugId = t.title.match(bugPattern)[1];
                    s.bugs.push(bugId);
                    totalBugs++;
                }

                switch (t.state) {
                    case "passed":
                        s.passing++;
                        totalPassing++;
                        break;
                    case "failed":
                        s.failing++;
                        totalFailing++;
                        break;
                    case "pending":
                        s.pending++;
                        totalPending++;
                        break;
                    case "skipped":
                        s.skipped++;
                        totalSkipped++;
                        break;
                }
            });
        });
    });

    const rows = [
        ["Spec", "Tests", "Passing", "Failing", "Pending", "Skipped", "Bug Count", "Bug IDs"],
    ];

    for (const [spec, s] of Object.entries(specs)) {
        const bugCell = s.bugs.length ? s.bugs.join("\n") : "-";
        rows.push([
            spec,
            s.total,
            s.passing,
            s.failing ? red(s.failing) : s.failing,
            s.pending,
            s.skipped,
            s.bugs.length ? red(s.bugs.length) : 0,
            bugCell,
        ]);
    }

    // Summary row
    const failedPct = totalTests ? Math.round((totalFailing / totalTests) * 100) : 0;
    const summaryText = `✖ ${totalFailing} of ${totalTests} failed (${failedPct}%)`;
    rows.push([summaryText, "", "", "", "", "", totalBugs ? red(totalBugs) : 0, "-"]);

    const output = table(rows, {
        columns: { 7: { width: 20, wrapWord: true } },
        drawHorizontalLine: (index, size) => {
            if (index === 0) return true; // top
            if (index === 1) return true; // header
            if (index > 1 && index < size - 1) return true; // after each spec
            if (index === size - 1) return true; // before summary
            if (index === size) return true; // bottom
            return false;
        },
    });

    console.log(output);
}

await run();
