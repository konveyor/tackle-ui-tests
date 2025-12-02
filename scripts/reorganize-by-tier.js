#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load the mapping
const mapping = JSON.parse(fs.readFileSync('tier-mapping.json', 'utf-8'));

// Base paths
const BASE_TEST_DIR = 'cypress/e2e/tests';

// Function to move file preserving directory structure
const moveFile = (oldPath, tier) => {
  // Extract the relative path after 'cypress/e2e/tests/'
  const relativePath = oldPath.replace(`${BASE_TEST_DIR}/`, '');

  // Create new path with tier directory
  const newPath = path.join(BASE_TEST_DIR, tier, relativePath);

  // Create the directory structure
  const newDir = path.dirname(newPath);
  execSync(`mkdir -p "${newDir}"`, { stdio: 'inherit' });

  // Move the file using git mv to preserve history
  try {
    execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: 'inherit' });
    console.log(`✓ Moved: ${oldPath} → ${newPath}`);
    return true;
  } catch (err) {
    console.error(`✗ Failed to move: ${oldPath}`);
    console.error(`  Error: ${err.message}`);
    return false;
  }
};

// Process each tier
console.log('\n=== Reorganizing Test Files by Tier ===\n');

let totalMoved = 0;
let totalFailed = 0;

Object.keys(mapping).sort().forEach(tier => {
  const files = mapping[tier];
  console.log(`\n## Processing ${tier} (${files.length} files)...`);

  files.forEach(file => {
    const success = moveFile(file, tier);
    if (success) {
      totalMoved++;
    } else {
      totalFailed++;
    }
  });
});

console.log(`\n=== Summary ===`);
console.log(`Total files moved: ${totalMoved}`);
console.log(`Total files failed: ${totalFailed}`);
console.log(`\nNew directory structure:`);
console.log(`  ${BASE_TEST_DIR}/`);
console.log(`    ├── ci/`);
console.log(`    ├── tier0/`);
console.log(`    ├── tier1/`);
console.log(`    ├── tier2/`);
console.log(`    ├── tier3/`);
console.log(`    ├── tier4/`);
console.log(`    ├── tier5/`);
console.log(`    └── NO_TAG/`);
console.log(`\nYou can now use fast spec patterns:`);
console.log(`  cypress run --spec "cypress/e2e/tests/tier0/**/*.test.ts"`);
console.log(`  cypress run --spec "cypress/e2e/tests/tier1/**/*.test.ts"`);
console.log(`  cypress run --spec "cypress/e2e/tests/{tier0,tier1}/**/*.test.ts"`);
