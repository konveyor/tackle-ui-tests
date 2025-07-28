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
        svn_user: "qe-admin",
        svn_password: "Dog8code",
        jira_stage_datacenter_url: "https://issues.stage.redhat.com/",
        jira_stage_bearer_token: "",
        jira_stage_basic_login: "",
        jira_stage_basic_password: "",
        jira_atlassian_cloud_email: "",
        jira_atlassian_cloud_token: "",
        jira_atlassian_cloud_url: "",
        jira_atlassian_cloud_project: "Test",
        jira_stage_datacenter_project_id: 12335626,
        rwx_enabled: true,
        logLevel: "ASSERT",
        mtaVersion: "",
        FAIL_FAST_PLUGIN: true,
        FAIL_FAST_ENABLED: false,
        metricsUrl: "",
    },
    retries: {
        runMode: 0,
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
        specPattern: "cypress/e2e/**/*.test.{js,jsx,ts,tsx}",
        baseUrl:
            process.env.CYPRESS_baseUrl ||
            "https://tackle-konveyor-tackle.apps.mig09.rhos-psi.cnv-qe.rhood.us",
        setupNodeEvents(on, config) {
            require("./cypress/plugins/index.js")(on, config);
            on("file:preprocessor", tagify(config));
            require("cypress-fail-fast/plugin")(on, config);
            require("cypress-fs/plugins")(on, config);
            return config;
        },
        experimentalMemoryManagement: true,
    },
});
