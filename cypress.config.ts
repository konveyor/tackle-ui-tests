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
        jira_prod_url: "http://issues.redhat.com",
        jira_prod_key: "",
        jira_stage_url: "https://issues.stage.redhat.com",
        jira_stage_key: "ODIzNDc2OTk0NDg2OjqhAqjzbsoQ4of8jPGmAPQBgE+X",
        jira_private_email: "mta.qe.testing@gmail.com",
        jira_private_token:
            "ATATT3xFfGF0WxoR7v-di3daYt8F_xPXPd8XbR1QlBgSYf7bCTmW8u0_NozzOiTyq0xpmNzIMzr6jgwPOvDMCS4lpSsPbtlx4PJDj1L39U5VVZwoaNy7wu1jbf3oRV4MDSjI505Bb-hMSIQQwxCqmahKyWTe_zCPnNf0MduDYzQxzVspEaDTDnk=37A51C8A",
        jira_private_url: "https://mta-qe-testing.atlassian.net/",
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
