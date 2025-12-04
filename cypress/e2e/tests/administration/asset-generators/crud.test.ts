/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import { getRandomAssetGeneratorData, getRandomNumber } from "../../../../utils/data_utils";
import { checkSuccessAlert, exists, notExists } from "../../../../utils/utils";
import { AssetGenerator } from "../../../models/administration/asset-generators/asset-generator";
import { successAlertMessage } from "../../../views/common.view";

describe(["@tier2"], "CRUD operations on Asset Generators", () => {
    before("Load fixture data", function () {
        // Load fixture data
        cy.fixture("generator").then((generatorFixture) => {
            this.generatorFixture = generatorFixture;
        });
    });

    it("Perform CRUD tests on asset generator", function () {
        const generator = new AssetGenerator(
            getRandomAssetGeneratorData(this.generatorFixture["cf-k8s-helm-chart"])
        );

        generator.create();
        checkSuccessAlert(successAlertMessage, "New generator was successfully created.", true);
        exists(generator.name);

        const newName = `Generator-updatedName-${getRandomNumber()}`;
        generator.edit({ name: newName });
        checkSuccessAlert(successAlertMessage, "generator was successfully saved.", true);
        exists(newName);

        generator.delete();
        checkSuccessAlert(
            successAlertMessage,
            `Generator ${generator.name} was successfully deleted.`,
            true
        );
        notExists(generator.name);
    });
});
