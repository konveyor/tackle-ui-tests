import { defineConfig } from "cypress";
import { tagify } from "cypress-tags";

export default defineConfig({
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    env: {
        user: "admin",
        pass: "Dog8code",
        git_user: "",
        git_password: "",
        jira_email: "mta.qe.testing@gmail.com",
        jira_token:
            "ATATT3xFfGF0OaEyVWcq8N0FfE9ahkpAgC1_z6x_xtojG-51MtinINlMRSxP8rYrvnSK9TaCJSyVZrd5ptB6ajVmmK-vP0vuMFDNEaeb4Hx_WnPtipJxXUsgnr4TKeA99qFulZVophvjBviLjp6HmoM9pqGSJr6uxjpNQr2R3cyMaka7j1rqlU4=420CCF51",
        tackleUrl: "https://tackle-konveyor-tackle.apps.mtv03.rhos-psi.cnv-qe.rhood.us",
        rwx_enabled: true,
    },
    retries: {
        runMode: 2,
        openMode: 0,
    },
    reporter: "cypress-multi-reporters",
    reporterOptions: {
        reporterEnabled: "cypress-mochawesome-reporter, mocha-junit-reporter",
        cypressMochawesomeReporterReporterOptions: {
            reportDir: "cypress/reports",
            charts: true,
            reportPageTitle: "Tackle test report",
            embeddedScreenshots: true,
            inlineAssets: true,
        },
        mochaJunitReporterReporterOptions: {
            mochaFile: "cypress/reports/junit/results-[hash].xml",
        },
    },
    defaultCommandTimeout: 8000,
    e2e: {
        testIsolation: false,
        specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
        setupNodeEvents(on, config) {
            require("./cypress/plugins/index.js")(on, config);
            on("file:preprocessor", tagify(config));
        },
    },
});
