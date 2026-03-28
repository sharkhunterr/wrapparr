#!/usr/bin/env node
/**
 * Flexible release script for Wrapparr
 *
 * Features:
 * - Bump version using standard-version
 * - Push to GitLab and/or GitHub
 * - Create releases on GitLab and/or GitHub with content from GITHUB_RELEASES.md
 * - Deploy to Docker Hub (triggers CI)
 * - Support for dry-run mode
 *
 * Usage:
 *   npm run release              # Standard release (GitLab only)
 *   npm run release:github       # Release to both GitLab and GitHub
 *   npm run release:deploy       # Release and trigger Docker deploy
 *   npm run release:full         # Release to both + Docker deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const options = {
  github: args.includes('--github'),
  gitlab: !args.includes('--no-gitlab'),
  deploy: args.includes('--deploy'),
  dryRun: args.includes('--dry-run'),
  skipPush: args.includes('--skip-push'),
  skipRelease: args.includes('--skip-release'),
  releaseType: args.find(arg => ['patch', 'minor', 'major'].includes(arg)) || null,
};

function getRemoteUrl(remote) {
  try { return execSync(`git remote get-url ${remote}`, { encoding: 'utf8' }).trim(); }
  catch { return null; }
}

function exec(command, description) {
  console.log(`\n📦 ${description}...`);
  if (options.dryRun) { console.log(`   [DRY RUN] ${command}`); return ''; }
  try { return execSync(command, { encoding: 'utf8', stdio: 'inherit' }); }
  catch (error) { console.error(`❌ Failed: ${description}`); process.exit(1); }
}

function getLatestReleaseNotes() {
  const releasesFile = path.join(__dirname, '..', 'GITHUB_RELEASES.md');
  if (!fs.existsSync(releasesFile)) {
    console.warn('⚠️  GITHUB_RELEASES.md not found, release will have no description');
    return '';
  }
  const content = fs.readFileSync(releasesFile, 'utf8');
  const releaseMatch = content.match(/##\s+\[?v?[\d.]+\]?[^\n]*\n([\s\S]*?)(?=\n##|\n---|\Z)/);
  return releaseMatch ? releaseMatch[0].trim() : content.trim();
}

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return pkg.version;
}

async function main() {
  console.log('🚀 Wrapparr Release Script\n');
  console.log('Options:', options);

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status && !options.dryRun) {
      console.error('❌ Working directory not clean. Commit or stash changes first.');
      process.exit(1);
    }
  } catch { console.error('❌ Failed to check git status'); process.exit(1); }

  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  console.log(`\n📌 Current branch: ${currentBranch}`);

  const gitlabUrl = getRemoteUrl('origin');
  console.log(`\n🔗 Remotes:`);
  console.log(`   GitLab: ${gitlabUrl || 'not configured'}`);
  console.log(`   GitHub: will use GITHUB_TOKEN env var or gh CLI auth`);

  if (options.gitlab && !gitlabUrl) { console.error('❌ GitLab remote (origin) not configured'); process.exit(1); }

  // Step 1: Bump version
  let versionCmd = 'npx standard-version';
  if (options.releaseType) versionCmd += ` --release-as ${options.releaseType}`;
  if (options.dryRun) versionCmd += ' --dry-run';
  exec(versionCmd, 'Bumping version with standard-version');

  if (options.dryRun) { console.log('\n✅ Dry run completed. No changes made.'); return; }

  const newVersion = getCurrentVersion();
  const tag = `v${newVersion}`;
  console.log(`\n✨ New version: ${tag}`);

  // Step 2: Push
  if (!options.skipPush) {
    const pushOptions = options.deploy ? '-o ci.variable="DEPLOY=true"' : '';
    if (options.gitlab) {
      exec(`git push origin ${currentBranch} --follow-tags ${pushOptions}`, 'Pushing to GitLab');
      if (options.github) console.log('\n💡 GitHub push will be handled by GitLab CI');
    }
  }

  // Step 3: Create releases
  if (!options.skipRelease) {
    const releaseNotes = getLatestReleaseNotes();
    const releaseNotesFile = '/tmp/wrapparr-release-notes.md';
    fs.writeFileSync(releaseNotesFile, releaseNotes);

    if (options.gitlab && gitlabUrl) {
      try {
        execSync('which glab', { stdio: 'ignore' });
        exec(`glab release create ${tag} --notes-file "${releaseNotesFile}" --name "Release ${tag}"`, 'Creating GitLab release');
      } catch { console.warn('⚠️  glab CLI not found. Skipping GitLab release creation.'); }
    }

    if (options.github) {
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPO || 'your-username/wrapparr';
      if (!githubToken) {
        console.warn('⚠️  GITHUB_TOKEN not found. GitHub release will be created by GitLab CI');
      } else {
        try {
          execSync('which gh', { stdio: 'ignore' });
          exec(`GH_TOKEN=${githubToken} gh release create ${tag} --repo ${githubRepo} --notes-file "${releaseNotesFile}" --title "Release ${tag}"`, 'Creating GitHub release');
        } catch { console.warn('⚠️  gh CLI not found. GitHub release will be created by GitLab CI'); }
      }
    }

    if (fs.existsSync(releaseNotesFile)) fs.unlinkSync(releaseNotesFile);
  }

  console.log('\n✅ Release completed successfully!');
  console.log(`\n📦 Version: ${tag}`);
  if (options.deploy) {
    console.log(`\n🐳 Docker deployment triggered via GitLab CI`);
    console.log(`   Check pipeline: ${gitlabUrl}/-/pipelines`);
  }
}

main().catch(error => { console.error('\n❌ Release failed:', error.message); process.exit(1); });
