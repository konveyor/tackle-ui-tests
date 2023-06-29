import { defineConfig } from "cypress";
import { tagify } from "cypress-tags";

export default defineConfig({
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    env: {
        jira_stage_datacenter_url: "",
        jira_stage_bearer_token: "",
        jira_atassian_cloud_email: "",
        jira_atassian_cloud_token: "",
        jira_atassian_cloud_url: "",
        rwx_enabled: true,
        user: "admin",
        pass: "Dog8code",
        git_user: "abrugaro",
        _git_user: "Shveta22",
        git_password: "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",
        _git_password: "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",
        tackleUrl: "https://mta-openshift-mta.apps.mig08.rhos-psi.cnv-qe.rhood.us",
        __tackleUrl: "https://mta-openshift-mta.apps.mig07.rhos-psi.cnv-qe.rhood.us",
        _tackleUrl: "http://localhost:9000/",
        keycloakAdminPassword: "SQu4-SgYA8hPiQ==",
        grepTags: "",
        jira_email: "mta.qe.testing@gmail.com",
        jira_key: "",
        jira_url: "https://mta-qe-testing.atlassian.net",
        jira_token:
            "ATATT3xFfGF0dAtmKn_LTWIVfqYNSuyUjUAdE1rukJnkZvzCVn_1jw40ZdOI5oZmw8vO62us8tGA99LhtVLWoJHlc79nI19_PnttREPwMj9pPNYD9ZEhm3m3qQyEt5L0-U_Q7aIk0H5Ssu8C7yp7t_2yhHNCue0IUGiT7JNVP03M27zzubhYixg=8E8D0B39",
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
