import chalk from "chalk";
import { merge } from "mochawesome-merge";
import { table } from "table";

const bugPattern = /Bug\s+([A-Z]+-\d+)/i;
const fileArg = process.argv[2] || "cypress/reports/*.json";

// Merge mochawesome JSON reports
const json = await merge({ files: [fileArg] });

// Collect and aggregate per-spec data
const specs = {};
let totalDuration = 0;

json.results.forEach((result) => {
    const specName = result.file?.split("/").pop() ?? "unknown";
    specs[specName] ||= {
        total: 0,
        passing: 0,
        failing: 0,
        pending: 0,
        skipped: 0,
        bugs: [],
        duration: 0,
    };

    totalDuration += result.stats?.duration ?? 0;

    result.suites.forEach((suite) => {
        suite.tests.forEach((t) => {
            const s = specs[specName];
            s.total++;
            s.duration += t.duration || 0;

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

// Sort specs alphabetically
const sortedSpecs = Object.entries(specs).sort(([a], [b]) => a.localeCompare(b));

let total = { total: 0, passing: 0, failing: 0, pending: 0, skipped: 0, bugs: 0 };
const rows = [
    ["Spec", "Tests", "Passing", "Failing", "Pending", "Skipped", "Bug Count", "Bug IDs"],
];

// Fill rows
for (const [spec, s] of sortedSpecs) {
    total.total += s.total;
    total.passing += s.passing;
    total.failing += s.failing;
    total.pending += s.pending;
    total.skipped += s.skipped;
    total.bugs += s.bugs.length;

    rows.push([
        spec,
        s.total,
        s.passing,
        s.failing ? chalk.red(s.failing) : s.failing,
        s.pending,
        s.skipped,
        s.bugs.length ? chalk.red(s.bugs.length) : s.bugs.length,
        s.bugs.length ? s.bugs.join("\n") : "-",
    ]);
}

// Calculate fail percentage
const failRate = total.total ? Math.round((total.failing / total.total) * 100) : 0;

// Convert total duration (ms) → hh:mm:ss
function formatDuration(ms) {
    const sec = Math.floor(ms / 1000);
    const h = String(Math.floor(sec / 3600)).padStart(1, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

const durationStr = formatDuration(totalDuration);

// Summary label
const summaryLabel = chalk.red(`✖ ${total.failing} of ${total.total} failed (${failRate}%)`);

// Add final aggregate line
rows.push([
    `${summaryLabel}   ${chalk.gray(durationStr)}`,
    total.total,
    total.passing,
    chalk.red(total.failing),
    total.pending,
    total.skipped,
    total.bugs ? chalk.red(total.bugs) : total.bugs,
    "-",
]);

console.log(table(rows));
