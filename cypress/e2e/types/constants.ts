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
export const answer = "Answer";
export const applicationName = "Application name";
export const application = "Application";
export const applicationInventory = "Application inventory";
export const customMigrationTargets = "Custom migration targets";
export const migrationWaves = "Migration waves";
export const assess = "Assess";
export const assessment = "Assessment";
export const analysis = "Analysis";
export const analyzeButton = "Analyze";
export const artifact = "Artifact";
export const businessServices = "Business services";
export const businessService = "Business service";
export const button = "button";
export const category = "Category";
export const clearAllFilters = "Clear all filters";
export const controls = "Controls";
export const color = "Color";
export const confidence = "Confidence";
export const createNewButton = "Create new";
export const criticality = "Criticality";
export const credentials = "Credentials";
export const credentialType = "Credential type";
export const deleteAction = "Delete";
export const editAction = "Edit";
export const startDate = "Start date";
export const endDate = "End date";
export const exportToIssueManagerAction = "Export to Issue Manager";
export const description = "Description";
export const displayName = "Display name";
export const effort = "Effort";
export const email = "Email";
export const group = "Stakeholder groups";
export const groupCount = "Group count";
export const git = "Git";
export const invalidEmailMsg = "This field requires a valid email.";
export const jobFunctions = "Job functions";
export const jobFunction = "Job function";
export const member = "Member";
export const memberCount = "Member count";
export const name = "Name";
export const next = "Next";
export const priority = "Priority";
export const question = "Question";
export const rank = "Rank";
export const review = "Review";
export const risk = "Risk";
export const owner = "Owner";
export const createdBy = "Created By";
export const reports = "Reports";
export const repositoryType = "Repository type";
export const save = "Save";
export const stakeholders = "Stakeholders";
export const stakeholderGroups = "Stakeholder groups";
export const subversion = "Subversion";
export const tag = "Tag";
export const tagCount = "Tag count";
export const tags = "Tags";
export const tdTag = "td";
export const trTag = "tr";
export const tagCategory = "Tag category";
export const tagName = "Tag name";
export const selectNone = "Select none";
export const manageApplications = "Manage applications";

export const createAppButton = "#create-application";
export const assessAppButton = "#assess-application";
export const reviewAppButton = "#review-application";
export const analyzeAppButton = "#analyze-application";
export const actionsButton = "button[aria-label=Actions]";
export const duplicateMigrationWaveError =
    "Danger alert:The migration wave could not be created due to a conflict with an existing wave. Make sure the name and start/end dates are unique and try again.";

// Error helper messages general to all views
export const duplicateErrMsg = "ERROR: duplicate key value violates unique constraint";
export const duplicateEmail =
    "A stakeholder with this email address already exists. Use a different email address.";
export const duplicateApplication =
    "An application with this name already exists. Use a different name.";
export const duplicateTagTypeName =
    "A tag type with this name already exists. Use a different name.";
export const duplicateTagName = "A tag with this name already exists. Use a different name.";
export const duplicateJobFunctionName =
    "A job function with this name already exists. Use a different name.";
export const duplicateStakeholderGroupName =
    "An stakeholder group with this name already exists. Use a different name.";
export const duplicateBusinessService =
    "A business service with this name already exists. Use a different name.";

export const fieldReqMsg = "This field is required.";
export const max40CharMsg = "This field must contain fewer than 40 characters.";
export const max120CharsMsg = "This field must contain fewer than 120 characters.";
export const max250CharsMsg = "This field must contain fewer than 250 characters.";
export const minCharsMsg = "This field must contain at least 3 characters.";

export const SEC = 1000;
export const administration = "Admin";
export const migration = "Migration";
export const general = "General";
export const instanceName = "Instance name";
export const cantDeleteJiraAlert =
    "Danger alert:This instance contains issues associated with applications and cannot be deleted";

export enum CredentialType {
    proxy = "Proxy",
    sourceControl = "Source Control",
    maven = "Maven",
    jiraBasic = "Basic Auth (Jira)",
    jiraToken = "Bearer Token (Jira)",
}

export enum JiraType {
    cloud = "Jira Cloud",
    server = "Jira Server/Datacenter",
}

export enum JiraIssueTypes {
    task = "Task",
    bug = "Bug",
    epic = "Epic",
    story = "Story",
}

export enum UserCredentials {
    usernamePassword = "Username/Password",
    sourcePrivateKey = "Source PrivateKey",
}

export enum UserRoles {
    admin = "tackle-admin",
    architect = "tackle-architect",
    migrator = "tackle-migrator",
}

export enum AnalysisStatuses {
    notStarted = "Not started",
    scheduled = "Scheduled",
    inProgress = "In-progress",
    completed = "Completed",
    failed = "Failed",
    canceled = "Canceled",
}

export enum RepositoryType {
    git = "Git",
    subversion = "Subversion",
}

export enum CustomRuleType {
    Repository = "Repository",
    Manual = "Manual",
}

export enum SortType {
    ascending = "ascending",
    descending = "descending",
}
