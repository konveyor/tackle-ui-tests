# Parallel Test Execution

This document explains how parallel test execution is configured in the Tackle UI test suite.

## Overview

The test suite now supports parallel execution using GitHub Actions matrix strategy combined with the `cypress-split` plugin. This approach **does not require Cypress Dashboard** and can significantly reduce total test execution time.

## How It Works

### Without Parallel Execution
- All 144+ test files run sequentially in a single job
- Estimated time: 60-120+ minutes (depending on analysis tests)

### With Parallel Execution (4 containers)
- Tests are automatically split across 4 parallel jobs
- Each job runs ~25% of the tests
- Estimated time: 15-30 minutes (75% reduction)

## Configuration

### 1. GitHub Actions Workflow

The workflow uses a matrix strategy to create multiple parallel jobs:

```yaml
strategy:
    fail-fast: false
    matrix:
        containers: [1, 2, 3, 4]
```

### 2. Cypress Split Plugin

The `cypress-split` plugin (installed in `package.json`) automatically distributes test files across containers based on:
- `SPLIT` environment variable: Total number of containers
- `SPLIT_INDEX` environment variable: Current container index (0-based)

### 3. Test Distribution

Tests are split by file, not by individual test cases. The plugin:
1. Collects all test files matching the spec pattern
2. Divides them evenly across the number of containers
3. Each container runs its assigned subset

## Adjusting Parallelization

### Change Number of Parallel Containers

Edit `.github/workflows/run-ui-tests.yaml`:

```yaml
matrix:
    containers: [1, 2, 3, 4]  # Change to desired number
```

**Examples:**

- **2 containers:** `containers: [1, 2]` - 50% reduction in time
- **3 containers:** `containers: [1, 2, 3]` - 66% reduction in time
- **4 containers:** `containers: [1, 2, 3, 4]` - 75% reduction in time
- **8 containers:** `containers: [1, 2, 3, 4, 5, 6, 7, 8]` - 87.5% reduction in time

**Note:** GitHub Actions has concurrent job limits based on your plan:
- Free plan: 20 concurrent jobs
- Team plan: 60 concurrent jobs
- Enterprise: Higher limits

### Considerations

1. **GitHub Runner Availability**
   - More containers = more concurrent runners needed
   - If runners are busy, jobs will queue

2. **Setup Overhead**
   - Each container has setup time (minikube, install Konveyor, etc.)
   - Too many containers can increase total overhead

3. **Test Distribution**
   - Some tests are slower (analysis tests with 10-minute timeouts)
   - The split is by file count, not by execution time
   - You may want to split slow tests into separate files for better distribution

4. **Resource Constraints**
   - Each job needs its own minikube instance
   - Monitor resource usage and adjust accordingly

## Recommended Settings

### For CI/CD Pipeline
- **4 containers** - Good balance of speed and resource usage
- Tests complete in ~25% of original time

### For Nightly Runs
- **6-8 containers** - Maximum parallelization
- Tests complete faster with more resources

### For Pull Requests
- **2-3 containers** - Moderate parallelization
- Saves runner resources for other PRs

## Monitoring Parallel Execution

### View Test Distribution

When tests run, cypress-split logs which tests each container is running:

```
Container 1/4: Running 36 specs
Container 2/4: Running 36 specs
Container 3/4: Running 36 specs
Container 4/4: Running 36 specs
```

### Check Execution Time

Compare job durations in GitHub Actions:
1. Go to Actions tab
2. Click on a workflow run
3. View individual job durations
4. Ideally, all containers should finish around the same time

### Identify Bottlenecks

If one container takes much longer:
- It has slower tests (likely analysis tests)
- Consider splitting those test files further
- Or manually assign slow tests to specific containers

## Local Testing

The parallel execution is configured for GitHub Actions. For local testing:

```bash
# Run normally (all tests)
npm run e2e:run:local

# Run with tags
CYPRESS_INCLUDE_TAGS="@tier0" npm run e2e:run:local

# Manual parallel split (advanced)
SPLIT=4 SPLIT_INDEX=0 npm run e2e:run:local  # Container 1
SPLIT=4 SPLIT_INDEX=1 npm run e2e:run:local  # Container 2
# etc.
```

## Troubleshooting

### Tests Not Splitting

**Problem:** All tests run on one container

**Solution:**
1. Verify `cypress-split` is installed: `npm list cypress-split`
2. Check that `cypressSplit(on, config)` is in `cypress.config.ts`
3. Verify environment variables are set in workflow

### Uneven Distribution

**Problem:** Some containers finish much faster

**Solution:**
- This is expected due to analysis tests (10-minute timeouts)
- Consider splitting slow tests into more files
- Or use tier tags to separate slow tests

### Artifacts Not Uploading

**Problem:** Test artifacts missing or overwritten

**Solution:**
- Verify artifact names include `${{ matrix.containers }}`
- Check the artifact upload step in workflow

## Future Improvements

1. **Smart Test Distribution**
   - Track test execution times
   - Distribute based on duration, not file count

2. **Tier-Based Splitting**
   - Run @tier0 tests first
   - Parallelize @tier1 and @tier2 separately

3. **Conditional Parallelization**
   - Use matrix only for full test runs
   - Single container for quick smoke tests

## Cost Considerations

- **Free tier:** 2,000 minutes/month
- **4 containers running 30 minutes:** 120 minutes per run
- **~16 full test runs per month** with free tier

Monitor usage in: Settings → Billing → Actions usage

## Additional Resources

- [cypress-split documentation](https://github.com/bahmutov/cypress-split)
- [GitHub Actions matrix strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Cypress parallelization best practices](https://docs.cypress.io/guides/guides/parallelization)
