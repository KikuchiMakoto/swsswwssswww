import { execSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dir, '..');
const distDir = resolve(projectRoot, 'dist');

function run(command: string, cwd: string = projectRoot) {
  console.log(`> ${command} (in ${cwd})`);
  execSync(command, { cwd, stdio: 'inherit' });
}

function runCapture(command: string, cwd: string = projectRoot): string {
  return execSync(command, { cwd, encoding: 'utf-8' }).trim();
}

console.log('🚀 Starting single-commit GitHub Pages deployment...');

// 1. Determine remote origin URL
let remoteUrl = 'https://github.com/KikuchiMakoto/soundgen.git';
try {
  const detected = runCapture('git config --get remote.origin.url', projectRoot);
  if (detected) {
    remoteUrl = detected;
  }
} catch {
  // fallback to default
}
console.log(`📡 Remote repository URL: ${remoteUrl}`);

// 2. Fresh production build
console.log('🔨 Building static assets...');
run('bun run build', projectRoot);

if (!existsSync(distDir)) {
  throw new Error(`Build directory not found at ${distDir}`);
}

// 3. Ensure .nojekyll is present in dist/
const distNoJekyll = resolve(distDir, '.nojekyll');
if (!existsSync(distNoJekyll)) {
  writeFileSync(distNoJekyll, '');
}

// 4. Remove any existing git metadata inside dist/
const distGit = resolve(distDir, '.git');
if (existsSync(distGit)) {
  rmSync(distGit, { recursive: true, force: true });
}

// 5. Initialize fresh git repo in dist/ and create exactly 1 commit
try {
  console.log('📦 Initializing fresh git repo in dist/ ...');
  run('git init -b gh-pages', distDir);
  run('git config user.name "Makoto KUNO"', distDir);
  run('git config user.email "mkt755778@gmail.com"', distDir);
  run('git add -A', distDir);

  const timestamp = new Date().toISOString();
  run(`git commit -m "deploy: static assets for GitHub Pages (${timestamp})"`, distDir);

  // 6. Force-push the single commit to remote gh-pages branch
  console.log('📤 Force-pushing 1 single commit to gh-pages branch on origin...');
  run(`git remote add origin ${remoteUrl}`, distDir);
  run('git push -f origin gh-pages', distDir);

  console.log('✅ Deployment push succeeded!');
} finally {
  // 7. Clean up temporary git files in dist/
  if (existsSync(distGit)) {
    console.log('🧹 Cleaning up temporary git files in dist/ ...');
    rmSync(distGit, { recursive: true, force: true });
  }
}

console.log('🎉 GitHub Pages single-commit deployment complete!');
