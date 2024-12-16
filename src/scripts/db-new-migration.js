#!/usr/bin/env node
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Please provide a name for the migration:');
  console.error('npm run db:new:migration CreatePropertyTable');
  process.exit(1);
}
const name = args[0];

const { spawnSync } = require('child_process');
const result = spawnSync('npx', [
  'ts-node', 
  './node_modules/typeorm/cli.js', 
  'migration:generate', 
  `src/database/migrations/${name}`, 
  '-d', 
  'src/database/data-source.ts'
], { stdio: 'inherit' });

process.exit(result.status);