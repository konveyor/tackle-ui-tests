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

export const tasksStatusColumn = "td[data-label='Status']";
export enum TaskManagerColumns {
    id = 'td[data-label="ID"]',
    application = 'td[data-label="Application"]',
    status = 'td[data-label="Status"]',
    kind = 'td[data-label="Kind"]',
    priority = 'td[data-label="Priority"]',
    preemption = 'td[data-label="Preemption"]',
    createdBy = 'td[data-label="Created By"]',
}
export const tasksTable = "table[aria-label='Tasks table']";
export enum TaskManagerTableHeaders {
    id = "ID",
    application = "Application",
    status = "Status",
    kind = "Kind",
    priority = "Priority",
    preemption = "Preemption",
    createdBy = "Created By",
    pod = "Pod",
    started = "Started",
    terminated = "Terminated",
}
