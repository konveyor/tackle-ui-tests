#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Find all test files
const files = execSync('find cypress/e2e/tests -name "*.test.ts" -type f', { encoding: 'utf-8' })
  .trim()
  .split('\n');

console.log('=== Checking for files with multiple tier tags ===\n');

let multiTierFiles = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');

  // Find all describe blocks
  const describeBlocks = content.match(/describe\(\[.*?\]/g) || [];

  // Extract all tier tags from all describe blocks
  const tiers = new Set();
  describeBlocks.forEach(block => {
    const tierMatch = block.match(/@tier(\d)/);
    if (tierMatch) {
      tiers.add(`@tier${tierMatch[1]}`);
    }
  });

  if (tiers.size > 1) {
    multiTierFiles.push({ file, tiers: Array.from(tiers) });
    console.log(`❌ MULTIPLE TIERS FOUND: ${file}`);
    console.log(`   Tiers: ${Array.from(tiers).join(', ')}`);

    // Show the describe blocks
    describeBlocks.forEach(block => {
      console.log(`   - ${block}`);
    });
    console.log('');
  }
});

if (multiTierFiles.length === 0) {
  console.log('✅ No files found with multiple tier tags');
  console.log('   Each file has only ONE tier tag (or no tier tag)');
} else {
  console.log(`\n⚠️  Found ${multiTierFiles.length} files with multiple tiers`);
  console.log('   These files need to be split manually before reorganization');
}
