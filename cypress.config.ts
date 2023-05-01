import { defineConfig } from "cypress";

export default defineConfig({
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    env: {
        user: "admin",
        pass: "Dog8code",
        git_user: "",
        git_password: "",
        tackleUrl: "https://tackle-konveyor-tackle.apps.mig01.cnv-qe.rhcloud.com/",
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
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            return require("./cypress/plugins/index.js")(on, config);
        },
        specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    },
});
