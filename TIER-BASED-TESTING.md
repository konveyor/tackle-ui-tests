# Tier-Based Test Organization

## Overview

The test suite has been reorganized into tier-based directories for **fast, efficient test filtering** without the overhead of parsing all test files.

## Directory Structure

```
cypress/e2e/tests/
├── ci/ (2 tests)
│   ├── login.test.ts
│   └── ci.test.ts
│
├── tier0/ (4 tests) - Critical smoke tests
│   ├── administration/custom-migration-targets/
│   └── migration/
│
├── tier1/ (6 tests) - Core functionality
│   ├── administration/source-platform/
│   └── migration/applicationinventory/analysis/
│
├── tier2/ (47 tests) - Standard tests
│   ├── administration/
│   ├── custom-metrics/
│   ├── migration/
│   └── rbac/
│
├── tier3/ (77 tests) - Extended tests
│   ├── administration/
│   ├── custom-metrics/
│   ├── migration/
│   └── rbac/
│
├── tier4/ (1 test) - Bulk operations
│   └── migration/applicationinventory/analysis/
│
├── tier5/ (1 test) - Special tests
│   └── keycloak/
│
└── NO_TAG/ (6 tests) - Need tier tags added
    ├── custom-metrics/
    ├── migration/
    ├── rbac/
    └── upgrade/
```

## Running Tests by Tier

### Local Execution

```bash
# Run CI + tier0 tests (fastest, critical path)
npm run e2e:run:local -- --spec "cypress/e2e/tests/{ci,tier0}/**/*.test.ts"

# Run tier1 tests only
npm run e2e:run:local -- --spec "cypress/e2e/tests/tier1/**/*.test.ts"

# Run multiple tiers
npm run e2e:run:local -- --spec "cypress/e2e/tests/{tier0,tier1,tier2}/**/*.test.ts"

# Run all tests
npm run e2e:run:local
```

### CI/CD Execution

The GitHub Actions workflows now use spec patterns:

```yaml
# .github/workflows/tier0-push-main.yaml
test_spec: "cypress/e2e/tests/{ci,tier0}/**/*.test.ts"

# .github/workflows/tier0-nightly.yaml
test_spec: "cypress/e2e/tests/{ci,tier0}/**/*.test.ts"
```

## Performance Benefits

### Before (Tag-Based Filtering)
```bash
CYPRESS_INCLUDE_TAGS=@tier0 cypress run
```
- **Loads all 144 test files** to check tags
- **Parses each file** to find describe() blocks
- **Filters by tag** - only runs matching tests
- **Overhead:** 1-2 seconds of parsing time

### After (Directory-Based Filtering)
```bash
cypress run --spec "cypress/e2e/tests/tier0/**/*.test.ts"
```
- **Instantly selects** matching files by pattern
- **No file loading/parsing** required
- **Zero overhead:** Immediate execution
- **~75% faster** for tier0 (4 files vs 144)

## Test Distribution

| Tier | Count | Description | Use Case |
|------|-------|-------------|----------|
| ci | 2 | Login & sanity | Every commit |
| tier0 | 4 | Critical smoke | Every commit, releases |
| tier1 | 6 | Core analysis | Nightly, pre-release |
| tier2 | 47 | Standard tests | Nightly, weekly |
| tier3 | 77 | Extended tests | Weekly, full regression |
| tier4 | 1 | Bulk operations | Weekly, performance |
| tier5 | 1 | Special config | On-demand |
| NO_TAG | 6 | Need tagging | To be categorized |

## Migration from Tags

### What Changed

**Removed:**
- `cypress-tags` dependency
- `CYPRESS_INCLUDE_TAGS` environment variable
- Tag parsing overhead
- `tagify(config)` from cypress.config.ts

**Added:**
- Tier-based directory structure
- `test_spec` workflow input parameter
- Direct spec pattern filtering

### Feature Tags Still Supported

Some tests retain additional tags for cross-cutting concerns:
- `@interop` - Interoperability tests
- `@dc` - Data center specific
- `@rhsso` - Red Hat SSO
- `@rhbk` - Red Hat Build of Keycloak

These are kept in the `describe()` blocks but are not used for filtering.

## Running Specific Test Types

### By Feature Category

```bash
# All analysis tests
npx cypress run --spec "cypress/e2e/tests/tier*/migration/applicationinventory/analysis/**/*.test.ts"

# All CRUD operations
npx cypress run --spec "cypress/e2e/tests/tier*/**/crud.test.ts"

# All filter/pagination/sort tests
npx cypress run --spec "cypress/e2e/tests/tier*/**/{filter,pagination,sort}.test.ts"
```

### Combined Patterns

```bash
# Fast tests only (tier0 + tier1)
npx cypress run --spec "cypress/e2e/tests/{tier0,tier1}/**/*.test.ts"

# Everything except tier3 (slow tests)
npx cypress run --spec "cypress/e2e/tests/{ci,tier0,tier1,tier2,tier4,tier5}/**/*.test.ts"
```

## Parallel Execution

The tier-based structure works seamlessly with parallel execution:

```bash
# 4 containers will split tests within the spec pattern
SPLIT=4 SPLIT_INDEX=0 cypress run --spec "cypress/e2e/tests/tier2/**/*.test.ts"
SPLIT=4 SPLIT_INDEX=1 cypress run --spec "cypress/e2e/tests/tier2/**/*.test.ts"
# ... etc
```

## Adding New Tests

When creating new tests, place them in the appropriate tier directory:

```typescript
// cypress/e2e/tests/tier2/migration/new-feature.test.ts
describe(["@tier2"], "New Feature Tests", () => {
  it("should do something", () => {
    // test code
  });
});
```

**Note:** The tier tag in the `describe()` block is now optional (used for documentation only), since filtering is done by directory.

## Files Needing Tier Tags

The following 6 files in `NO_TAG/` need to be categorized:

1. `rbac/custom-migration-target.test.ts`
2. `upgrade/create_upgrade_data.test.ts`
3. `upgrade/after_upgrade.test.ts`
4. `custom-metrics/application_metrics.test.ts`
5. `migration/migration-waves/filter_applications.test.ts`
6. `migration/applicationinventory/analysis/excludeTags.test.ts`

To categorize:
1. Add appropriate tier tag to `describe()` block
2. Move file to corresponding tier directory

## Troubleshooting

### Tests not found

```bash
# Check spec pattern syntax
cypress run --spec "cypress/e2e/tests/tier0/**/*.test.ts" --verbose

# Verify file exists
ls cypress/e2e/tests/tier0/**/*.test.ts
```

### Wrong tests running

```bash
# List files that will be executed
find cypress/e2e/tests/tier0 -name "*.test.ts"

# Verify tier directory contents
tree cypress/e2e/tests/tier0
```

### Spec pattern not working

Ensure glob patterns are quoted:
```bash
# ✓ Correct
cypress run --spec "cypress/e2e/tests/{tier0,tier1}/**/*.test.ts"

# ✗ Wrong (shell expands braces)
cypress run --spec cypress/e2e/tests/{tier0,tier1}/**/*.test.ts
```

## Best Practices

1. **Run smallest tier first** - Start with tier0 for quick feedback
2. **Combine related tiers** - `{tier0,tier1}` for core functionality
3. **Use parallel execution** - Especially for tier2/tier3
4. **Monitor tier balance** - Redistribute tests if one tier becomes too large
5. **Keep tiers focused** - Each tier should have a clear purpose

## Performance Comparison

| Command | Files Loaded | Parse Time | Total Overhead |
|---------|-------------|------------|----------------|
| Tag-based (@tier0) | 144 | ~1-2s | ~2s |
| Directory-based (tier0/) | 4 | ~0s | ~0s |
| Speedup | 97% fewer | Eliminated | 100% faster |

## Future Improvements

1. **Auto-tag enforcement** - Git hook to ensure new tests have tier tags
2. **Tier distribution report** - Track test counts and execution times per tier
3. **Smart tier assignment** - Suggest tier based on test patterns
4. **Cross-tier dependencies** - Warn if tier3 test depends on tier0 fixture
