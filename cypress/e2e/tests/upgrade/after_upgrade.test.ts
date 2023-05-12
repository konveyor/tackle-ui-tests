import {
    configureRWX,
    exists,
    expandRowDetails,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    isEnabled,
    isRwxEnabled,
    login,
    preservecookies,
} from "../../../utils/utils";
import { UpgradeData } from "../../types/types";
import { Credentials } from "../../models/administration/credentials/credentials";
import { Jobfunctions } from "../../models/migration/controls/jobfunctions";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../models/migration/controls/stakeholdergroups";
import { BusinessServices } from "../../models/migration/controls/businessservices";
import { TagCategory } from "../../models/migration/controls/tagcategory";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { MavenConfiguration } from "../../models/administration/repositories/maven";
import { clearRepository } from "../../views/repository.view";
import { GeneralConfig } from "../../models/administration/general/generalConfig";

describe(["@post-upgrade"], "Performing post-upgrade validations", () => {
    before("Login", function () {
        // Perform login
        login();

        const generalConfig = GeneralConfig.getInstance();
        generalConfig.enableDownloadCsv();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
        cy.fixture("upgrade-data").then((upgradeData: UpgradeData) => {
            this.upgradeData = upgradeData;
        });
    });

    it("Testing existence of instances created before upgrade", function () {
        const {
            sourceControlUsernameCredentialsName,
            mavenUsernameCredentialName,
            jobFunctionName,
            stakeHolderGroupName,
            stakeHolderName,
            businessServiceName,
            tagTypeName,
            tagName,
            sourceApplicationName,
            binaryApplicationName,
            uploadBinaryApplicationName,
        } = this.upgradeData;
        Credentials.openList();
        exists(sourceControlUsernameCredentialsName);
        exists(mavenUsernameCredentialName);

        Stakeholders.openList();
        exists(stakeHolderName);

        Stakeholdergroups.openList();
        exists(stakeHolderGroupName);

        Jobfunctions.openList();
        exists(jobFunctionName);

        BusinessServices.openList();
        exists(businessServiceName);

        TagCategory.openList();
        exists(tagTypeName);

        expandRowDetails(tagTypeName);
        exists(tagName);

        const sourceApplication = new Analysis(
            getRandomApplicationData(sourceApplicationName, { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        sourceApplication.name = sourceApplicationName;

        const binaryApplication = new Analysis(
            getRandomApplicationData(binaryApplicationName, { binaryData: this.appData[2] }),
            getRandomAnalysisData(this.analysisData[3])
        );
        binaryApplication.name = binaryApplicationName;

        const uploadBinaryApplication = new Analysis(
            getRandomApplicationData(uploadBinaryApplicationName),
            getRandomAnalysisData(this.analysisData[4])
        );
        uploadBinaryApplication.name = uploadBinaryApplicationName;

        Analysis.open();
        exists(sourceApplicationName);
        sourceApplication.downloadReport("CSV", false);
        exists(binaryApplicationName);
        binaryApplication.downloadReport("CSV", false);
        exists(uploadBinaryApplicationName);
        uploadBinaryApplication.downloadReport("CSV", false);

        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");

        binaryApplication.analyze();
        binaryApplication.verifyAnalysisStatus("Completed");

        uploadBinaryApplication.analyze();
        uploadBinaryApplication.verifyAnalysisStatus("Completed");

        MavenConfiguration.open();
        let rwxEnabled = isRwxEnabled();
        isEnabled(clearRepository, rwxEnabled);

        rwxEnabled = false;
        configureRWX(rwxEnabled);
        isEnabled(clearRepository, rwxEnabled);
    });
});
