#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all test files
const findTestFiles = () => {
  const output = execSync(
    'find cypress/e2e/tests -name "*.test.ts" -type f',
    { encoding: 'utf-8' }
  );
  return output.trim().split('\n');
};

// Extract tier tag from file
const extractTier = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const describeMatch = content.match(/describe\(\[(.*?)\]/);
    if (!describeMatch) return null;

    const tags = describeMatch[1];
    const tierMatch = tags.match(/@tier(\d)/);
    const ciMatch = tags.match(/@ci/);

    if (ciMatch) return 'ci';
    if (tierMatch) return `tier${tierMatch[1]}`;
    return null;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
};

// Analyze all files
const files = findTestFiles();
const mapping = {};

files.forEach(file => {
  const tier = extractTier(file);
  const key = tier || 'NO_TAG';
  if (!mapping[key]) mapping[key] = [];
  mapping[key].push(file);
});

// Print summary
console.log('\n=== Test File Distribution by Tier ===\n');
Object.keys(mapping).sort().forEach(tier => {
  console.log(`${tier}: ${mapping[tier].length} files`);
});

// Print detailed mapping
console.log('\n=== Detailed File Mapping ===\n');
Object.keys(mapping).sort().forEach(tier => {
  console.log(`\n## ${tier} (${mapping[tier].length} files):`);
  mapping[tier].forEach(file => console.log(`  ${file}`));
});

// Save mapping to file
fs.writeFileSync(
  'tier-mapping.json',
  JSON.stringify(mapping, null, 2)
);
console.log('\n\nMapping saved to tier-mapping.json');
