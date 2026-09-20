import { execSync } from 'node:child_process';
import { deployDistToGhPages } from './gh-pages-deploy.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--local-only');
const deployCloudflare = args.includes('--cloudflare') || process.env.CLOUDFLARE === '1';

console.log('\n▶️  INITIATING WEBSITE RESUME SEQUENCE...');

// 1. Run full production build
console.log('🔨 Building full production catalog, dish photos, packages, and assets...');
execSync('node scripts/build.mjs', {
  cwd: process.cwd(),
  stdio: 'inherit'
});

// 2. Deploy rebuilt dist/ to origin/gh-pages
console.log('\n📦 Deploying restored site to GitHub Pages...');
const result = deployDistToGhPages({
  commitMessage: 'deploy: restore full website and live catalog (230 dishes) [ci skip]',
  dryRun,
  deployCloudflare
});

console.log('\n=============================================================');
console.log('▶️  WEBSITE RESUMED & LIVE SUCCESSFULLY');
console.log('=============================================================');
console.log(`🌐 Live URL: https://sumanthmakkapati123.github.io/sri-vinayaka-caterers/`);
console.log('✨ All 230 dishes, packages, WhatsApp checkout, and admin are restored.');
console.log('\n💡 To pause the website at any time, run:');
console.log('   npm run site:pause');
console.log('=============================================================\n');
