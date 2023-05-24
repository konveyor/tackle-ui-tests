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
import { Credentials } from "../../models/administrator/credentials/credentials";
import { Jobfunctions } from "../../models/developer/controls/jobfunctions";
import { Stakeholders } from "../../models/developer/controls/stakeholders";
import { Stakeholdergroups } from "../../models/developer/controls/stakeholdergroups";
import { BusinessServices } from "../../models/developer/controls/businessservices";
import { TagType } from "../../models/developer/controls/tagtypes";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { MavenConfiguration } from "../../models/administrator/repositories/maven";
import { clearRepository } from "../../views/repository.view";

describe("Performing post-upgrade validations", { tags: "@post-upgrade" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@after-upgrade")) return;

        // Perform login
        login();
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

        TagType.openList();
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
        exists(binaryApplicationName);
        exists(uploadBinaryApplicationName);

        sourceApplication.analyze();
        binaryApplication.analyze();
        uploadBinaryApplication.analyze();

        sourceApplication.verifyAnalysisStatus("Completed");
        binaryApplication.verifyAnalysisStatus("Completed");
        uploadBinaryApplication.verifyAnalysisStatus("Completed");

        MavenConfiguration.open();
        let rwxEnabled = isRwxEnabled();
        isEnabled(clearRepository, rwxEnabled);

        rwxEnabled = false;
        configureRWX(rwxEnabled);
        isEnabled(clearRepository, rwxEnabled);
    });
});
