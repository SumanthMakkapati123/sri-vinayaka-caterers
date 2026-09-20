import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Deploys the current contents of dist/ to the gh-pages branch of the origin repository.
 * @param {Object} options
 * @param {string} options.commitMessage - Commit message for the deployment
 * @param {boolean} [options.dryRun=false] - If true, stages and commits locally without pushing
 * @param {boolean} [options.deployCloudflare=false] - If true, also runs wrangler deploy
 * @returns {{ remoteUrl: string, branch: string, pushed: boolean }}
 */
export function deployDistToGhPages({ commitMessage, dryRun = false, deployCloudflare = false } = {}) {
  const rootDir = process.cwd();
  const distDir = resolve(rootDir, 'dist');

  if (!existsSync(distDir)) {
    throw new Error(`dist directory does not exist at ${distDir}. Run build first.`);
  }

  // Get origin remote URL from root repo
  const remoteUrl = execSync('git config --get remote.origin.url', {
    cwd: rootDir,
    encoding: 'utf8'
  }).trim();

  if (!remoteUrl) {
    throw new Error('No remote.origin.url found in git configuration.');
  }

  console.log(`📦 Preparing git deployment from dist/ (remote: ${remoteUrl})...`);

  // Ensure dist is a git repo on gh-pages branch
  const hasGit = existsSync(resolve(distDir, '.git'));
  if (!hasGit) {
    execSync('git init -b gh-pages', { cwd: distDir, stdio: 'pipe' });
    execSync(`git remote add origin "${remoteUrl}"`, { cwd: distDir, stdio: 'pipe' });
  } else {
    try {
      execSync(`git remote set-url origin "${remoteUrl}"`, { cwd: distDir, stdio: 'pipe' });
    } catch {
      execSync(`git remote add origin "${remoteUrl}"`, { cwd: distDir, stdio: 'pipe' });
    }
  }

  // Stage all files in dist
  execSync('git add -A', { cwd: distDir, stdio: 'pipe' });

  // Commit changes if any
  const status = execSync('git status --porcelain', { cwd: distDir, encoding: 'utf8' }).trim();
  if (status) {
    const authorEmail = '137649259+Sumanthrao369@users.noreply.github.com';
    const authorName = 'Sumanthrao369';
    execSync(`git -c user.name="${authorName}" -c user.email="${authorEmail}" commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
      cwd: distDir,
      stdio: 'pipe'
    });
    console.log(`✅ Committed: "${commitMessage}"`);
  } else {
    console.log('ℹ️ No file changes detected in dist/.');
  }

  if (dryRun) {
    console.log('🔍 Dry run enabled: skipped pushing to remote.');
    return { remoteUrl, branch: 'gh-pages', pushed: false };
  }

  console.log('🚀 Pushing to origin/gh-pages branch...');
  execSync('git push --force origin gh-pages', {
    cwd: distDir,
    stdio: 'inherit'
  });
  console.log('🎉 Successfully deployed to gh-pages!');

  if (deployCloudflare) {
    console.log('☁️ Deploying to Cloudflare Workers via wrangler deploy...');
    execSync('npx wrangler deploy', { cwd: rootDir, stdio: 'inherit' });
    console.log('🎉 Successfully deployed to Cloudflare!');
  }

  return { remoteUrl, branch: 'gh-pages', pushed: true };
}
