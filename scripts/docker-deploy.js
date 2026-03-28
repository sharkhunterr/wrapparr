#!/usr/bin/env node
/**
 * Docker Hub deployment script for Wrapparr
 *
 * Usage:
 *   npm run docker:build          # Build locally
 *   npm run docker:deploy         # Build and push to Docker Hub
 *   npm run docker:deploy:multi   # Multi-platform build and push
 */

const { execSync } = require('child_process');
const fs = require('fs');

const args = process.argv.slice(2);
const options = {
  push: args.includes('--push'),
  multiPlatform: args.includes('--multi-platform'),
  latest: !args.includes('--no-latest'),
  dryRun: args.includes('--dry-run'),
  buildOnly: args.includes('--build-only'),
};

function getVersion() {
  return JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
}

function getDockerConfig() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return {
    image: pkg.config?.dockerImage || 'your-username/wrapparr',
    registry: pkg.config?.dockerRegistry || 'docker.io',
  };
}

function exec(command, description) {
  console.log(`\n🐳 ${description}...`);
  if (options.dryRun) { console.log(`   [DRY RUN] ${command}`); return ''; }
  try { execSync(command, { encoding: 'utf8', stdio: 'inherit' }); console.log('   ✅ Done'); }
  catch { console.error(`   ❌ Failed: ${description}`); process.exit(1); }
}

function main() {
  console.log('🐳 Wrapparr Docker Deployment Script\n');
  console.log('Options:', options);

  const version = getVersion();
  const { image, registry } = getDockerConfig();
  console.log(`\n📦 Version: ${version}`);
  console.log(`🐋 Image: ${registry}/${image}`);

  try { execSync('docker info', { stdio: 'ignore' }); }
  catch { console.error('❌ Docker is not running.'); process.exit(1); }

  const tags = [`${registry}/${image}:${version}`, `${registry}/${image}:v${version}`];
  if (options.latest) tags.push(`${registry}/${image}:latest`);
  console.log(`\n🏷️  Tags: ${tags.join(', ')}`);

  const dockerfile = 'docker/Dockerfile';
  if (options.multiPlatform) {
    exec('docker buildx create --use --name wrapparr-builder 2>/dev/null || docker buildx use wrapparr-builder', 'Setting up buildx');
    const tagArgs = tags.map(t => `-t ${t}`).join(' ');
    exec(`docker buildx build --platform linux/amd64,linux/arm64 ${tagArgs} ${options.push ? '--push' : '--load'} -f ${dockerfile} .`, 'Building multi-platform image');
  } else {
    const tagArgs = tags.map(t => `-t ${t}`).join(' ');
    exec(`docker build ${tagArgs} -f ${dockerfile} .`, 'Building Docker image');
    if (options.push && !options.buildOnly) {
      for (const tag of tags) exec(`docker push ${tag}`, `Pushing ${tag}`);
    }
  }

  console.log('\n✅ Docker deployment completed!');
  if (options.push) console.log(`\n📥 Pull: docker pull ${registry}/${image}:${version}`);
}

main();
