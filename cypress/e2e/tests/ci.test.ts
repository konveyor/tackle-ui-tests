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

import { assessReviewAndAnalyzeApplication } from "./migration/applicationinventory/applications/application_ci.test";
import { archetypeCRUD } from "./migration/archetypes/crud.test";
import { businessServiceCRUD } from "./migration/controls/businessservices/crud.test";
import { jobFunctionCRUD } from "./migration/controls/jobfunctions/crud.test";

describe("Sanity UI tests", () => {
    businessServiceCRUD();
    jobFunctionCRUD();
    archetypeCRUD();
    assessReviewAndAnalyzeApplication();
});
