# Cypress Wait Calls Analysis

**Generated:** 2025-12-02
**Test Suite:** MTA Tackle UI Tests

## Summary Statistics

- **Total cy.wait() calls:** 266
  - **Explicit time-based waits:** 93
  - **Intercept-based waits:** 173

## Performance Impact

### Explicit Wait Time Budget
Assuming all explicit waits execute (worst case):
- 40 second waits: 3 calls = 120 seconds (2 minutes)
- 35 second waits: 1 call = 35 seconds
- 30 second waits: 4 calls = 120 seconds (2 minutes)
- 10 second waits: 5 calls = 50 seconds
- 5 second waits: 4 calls = 20 seconds
- 3 second waits: 3 calls = 9 seconds
- 2 second waits: 52+ calls = 104+ seconds (1.7+ minutes)
- 1 second waits: 10+ calls = 10+ seconds
- Sub-second waits: 11 calls = ~6 seconds

**Estimated explicit wait time:** ~7.5 minutes minimum per full test run

---

## Explicit Time-Based Waits (93 total)

### Critical Long Waits (30+ seconds)

#### 40 seconds
```
cypress/e2e/tests/migration/migration-waves/export_to_jira_datacenter.test.ts:114
  cy.wait(40 * SEC); // Enough time to create both tasks and for them to be available in the Jira API
```

#### 35 seconds
```
cypress/e2e/tests/custom-metrics/jira_issue_metrics.test.ts:96
  cy.wait(35 * SEC); // Enough time to create both tasks and for them to be available in the Jira API
```

#### 30 seconds (4 occurrences)
```
cypress/e2e/tests/migration/migration-waves/export_to_jira_cloud.test.ts:132
  cy.wait(30 * SEC); // Enough time to create both tasks and for them to be available in the Jira API

cypress/e2e/tests/migration/migration-waves/unlink_application.test.ts:167
  cy.wait(30 * SEC); // Enough time to create both tasks and for them to be available in the Jira API

cypress/e2e/models/migration/custom-metrics/custom-metrics.ts:11
  cy.wait(30 * SEC);

cypress/e2e/models/migration/custom-metrics/custom-metrics.ts:16
  cy.wait(30 * SEC);

cypress/e2e/models/migration/custom-metrics/custom-metrics.ts:26
  cy.wait(30 * SEC);
```

### Moderate Waits (5-10 seconds)

#### 10 seconds (5 occurrences)
```
cypress/e2e/tests/rbac/custom-rules.test.ts:160
  cy.wait(10 * SEC);

cypress/e2e/tests/rbac/review-assessment.test.ts:65
  cy.wait(10 * SEC);

cypress/e2e/models/administration/assessment_questionnaire/assessment_questionnaire.ts:32
  cy.wait(10 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:166
  cy.wait(10 * SEC);

cypress/e2e/models/migration/controls/stakeholders.ts:66
  cy.wait(10 * SEC);
```

#### 5 seconds (4 occurrences)
```
cypress/e2e/tests/migration/task-manager/sorting.filter.pagination.test.ts:77
  cy.wait(5 * SEC);

cypress/e2e/tests/migration/controls/businessservices/create.test.ts:111
  cy.wait(5 * SEC);

cypress/e2e/models/administration/repositories/git.ts:17
  cy.wait(5 * SEC);

cypress/e2e/models/administration/assessment_questionnaire/assessment_questionnaire.ts:41
  cy.wait(5 * SEC);

cypress/e2e/models/migration/applicationinventory/manageImports.ts:46
  cy.wait(5 * SEC)

cypress/e2e/models/migration/applicationinventory/application.ts:614
  cy.wait(5 * SEC);
```

### Short Waits (2-4 seconds)

#### 4 seconds
```
cypress/e2e/models/migration/applicationinventory/application.ts:756
  cy.wait(4 * SEC);
```

#### 3 seconds (3 occurrences)
```
cypress/e2e/models/administration/assessment_questionnaire/assessment_questionnaire.ts:96
  cy.wait(3 * SEC);

cypress/e2e/models/migration/migration-waves/migration-wave.ts:375
  cy.wait(3 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:871
  cy.wait(3 * SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:589
  cy.wait(3 * SEC);
```

#### 2 seconds (52+ occurrences)
```
cypress/e2e/tests/rbac/upload_binary_analysis_architect.test.ts:79
  cy.wait(2 * SEC);

cypress/e2e/tests/rbac/upload_binary_analysis_migrator.test.ts:63
  cy.wait(2 * SEC);

cypress/e2e/tests/upgrade/create_upgrade_data.test.ts:154
  cy.wait(2 * SEC);

cypress/e2e/tests/upgrade/create_upgrade_data.test.ts:175
  cy.wait(2 * SEC);

cypress/e2e/tests/custom-metrics/assessment_metrics.test.ts:53
  cy.wait(2000);

cypress/e2e/tests/migration/applicationinventory/assessment/assessment_after_import.test.ts:63
  cy.wait(2000);

cypress/e2e/tests/migration/applicationinventory/manageimports/pagination.test.ts:44
  cy.wait(2000);

cypress/e2e/tests/migration/applicationinventory/manageimports/sort.test.ts:53
  cy.wait(2 * SEC);

cypress/e2e/tests/migration/applicationinventory/analysis/nodejs_analysis.test.ts:54
  cy.wait(2 * SEC);

cypress/e2e/tests/migration/applicationinventory/analysis/nodejs_analysis.test.ts:56
  cy.wait(2 * SEC);

cypress/e2e/tests/migration/controls/stakeholdergroups/interlinked.test.ts:70
  cy.wait(2000);

cypress/e2e/tests/migration/controls/stakeholdergroups/interlinked.test.ts:92
  cy.wait(2000);

cypress/e2e/tests/migration/controls/stakeholdergroups/interlinked.test.ts:106
  cy.wait(2000);

cypress/e2e/tests/migration/controls/tags/tagcategory/crud.test.ts:51
  cy.wait(2000);

cypress/e2e/tests/migration/controls/stakeholders/interlinked.test.ts:150
  cy.wait(2000);

cypress/e2e/models/administration/proxy/proxy.ts:72
  cy.wait(2 * SEC);

cypress/e2e/models/administration/proxy/proxy.ts:117
  cy.wait(2 * SEC);

cypress/e2e/models/administration/repositories/maven.ts:30
  cy.wait(2000);

cypress/e2e/models/administration/repositories/subversion.ts:16
  cy.wait(2 * SEC);

cypress/e2e/models/migration/dynamic-report/dependencies/dependencies.ts:31
  cy.wait(2 * SEC);

cypress/e2e/models/migration/dynamic-report/issues/issues.ts:48
  cy.wait(2 * SEC);

cypress/e2e/models/migration/task-manager/task-manager.ts:91
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:275
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/application.ts:328
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/application.ts:396
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/application.ts:608
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/application.ts:764
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:805
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:836
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:845
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:875
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:182
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:261
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/analysis.ts:263
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/analysis.ts:339
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:440
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:465
  cy.wait(2000);

cypress/e2e/models/migration/applicationinventory/analysis.ts:468
  cy.wait(2 * SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:472
  cy.wait(2 * SEC);

cypress/e2e/models/migration/controls/stakeholders.ts:144
  cy.wait(2000);

cypress/e2e/models/migration/controls/businessservices.ts:162
  cy.wait(2000);

cypress/e2e/models/migration/controls/jobfunctions.ts:78
  cy.wait(2000);

cypress/e2e/models/migration/controls/stakeholdergroups.ts:107
  cy.wait(2000);
```

### Very Short Waits (< 2 seconds)

#### 1 second (10+ occurrences)
```
cypress/e2e/tests/migration/dynamic-report/dependencies/filter.test.ts:203
  cy.wait(SEC);

cypress/e2e/tests/migration/applicationinventory/assessment/questionnaire_features.test.ts:76
  cy.wait(SEC);

cypress/e2e/models/keycloak/users/user.ts:91
  cy.wait(SEC);

cypress/e2e/models/keycloak/users/user.ts:179
  cy.wait(SEC);

cypress/e2e/models/keycloak/users/user.ts:189
  cy.wait(SEC);

cypress/e2e/models/migration/dynamic-report/dependencies/dependencies.ts:50
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:472
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:551
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:574
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:665
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:739
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:799
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:803
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:830
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/application.ts:834
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/analysis.ts:492
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/assessment.ts:116
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/assessment.ts:122
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/assessment.ts:222
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/assessment.ts:292
  cy.wait(SEC);

cypress/e2e/models/migration/applicationinventory/assessment.ts:323
  cy.wait(SEC * 10);

cypress/e2e/models/migration/controls/tagcategory.ts:125
  cy.wait(SEC);

cypress/e2e/models/migration/controls/tags.ts:145
  cy.wait(SEC);
```

#### Sub-second (500ms, 100ms)
```
cypress/e2e/tests/migration/applicationinventory/applications/create.test.ts:145
  cy.wait(100);

cypress/e2e/models/keycloak/users/user.ts:100
  cy.wait(500);

cypress/e2e/models/keycloak/users/user.ts:152
  cy.wait(500);
```

---

## Intercept-Based Waits (173 total)

These waits are generally more efficient as they wait for specific network requests rather than arbitrary time periods.

### Most Common Intercepts

| Intercept Alias | Count | Description |
|----------------|-------|-------------|
| `@getApplication` | 40+ | Waiting for application data to load |
| `@getTargets` | 15+ | Waiting for migration targets |
| `@postApplication` | 10+ | Waiting for application creation |
| `@deleteTarget` | 8+ | Waiting for target deletion |
| `@getArchetypes` | 5+ | Waiting for archetypes data |
| `@getBusinessService` | 3+ | Waiting for business service data |
| `@getIssues` | 3+ | Waiting for issues data |
| `@putWave` | 2+ | Waiting for migration wave update |
| `@deleteWave` | 2+ | Waiting for migration wave deletion |
| Various others | 75+ | Single or few occurrences |

### Sample Intercept Waits

```
cypress/e2e/tests/ci.test.ts:69
  cy.wait("@postBusinessService");

cypress/e2e/tests/ci.test.ts:85
  cy.wait("@postJobFunction");

cypress/e2e/tests/ci.test.ts:112
  cy.wait("@postArchetype");

cypress/e2e/tests/migration/migration-waves/crud.test.ts:81
  cy.wait("@postWave");

cypress/e2e/tests/administration/custom-migration-targets/crud.test.ts:127
  cy.wait("@deleteTarget");
```

---

## Recommendations

### High Priority (Reduce explicit waits)

1. **Replace Jira API waits (30-40 seconds)** - 4 occurrences
   - Use polling or intercepts instead of fixed 30-40 second waits
   - Files affected:
     - `export_to_jira_datacenter.test.ts`
     - `export_to_jira_cloud.test.ts`
     - `jira_issue_metrics.test.ts`
     - `unlink_application.test.ts`

2. **Replace custom metrics waits (30 seconds)** - 3 occurrences
   - File: `custom-metrics.ts`
   - Use proper assertions or polling instead of fixed waits

3. **Replace 10-second waits** - 5 occurrences
   - Most can be replaced with assertions or shorter polling

### Medium Priority

4. **Reduce 2-second waits** - 52+ occurrences
   - Many are in model files (reusable page objects)
   - Focus on:
     - `application.ts` (18+ waits)
     - `analysis.ts` (10+ waits)
     - `assessment.ts` (5+ waits)

5. **Replace arbitrary delays with assertions**
   - Use `cy.should()` with proper selectors instead of `cy.wait(time)`
   - Cypress will auto-retry until the condition is met

### Low Priority

6. **Intercept-based waits are mostly fine**
   - These wait for actual network responses
   - Consider adding timeout parameters to critical ones
   - Example: `cy.wait("@getApplication", { timeout: 10000 })`

### Code Pattern to Replace

❌ **Bad:**
```javascript
cy.wait(2 * SEC);
cy.get(selector).should("be.visible");
```

✅ **Good:**
```javascript
cy.get(selector, { timeout: 2000 }).should("be.visible");
```

---

## Files with Most Explicit Waits

1. **application.ts** - 30+ explicit waits
2. **analysis.ts** - 13+ explicit waits
3. **assessment.ts** - 6+ explicit waits
4. **user.ts** (Keycloak) - 5+ explicit waits
5. **custom-metrics.ts** - 3+ explicit waits (all 30 seconds)

---

## Parallel Execution Update

**Parallel execution has been configured!** See `PARALLEL-EXECUTION.md` for details.

With 4 parallel containers, the total test time should be reduced by ~75%, making the impact of wait times less severe. However, optimizing waits will still improve overall execution time and reduce flakiness.

## Next Steps

1. **Test the parallel execution** - Run the CI pipeline and monitor performance
2. Start with high-priority items (30-40 second waits)
3. Create helper functions for common wait patterns
4. Document expected wait times vs. actual in CI
5. Consider adding custom Cypress commands for smart waiting
6. Set up test timing metrics to track improvements
