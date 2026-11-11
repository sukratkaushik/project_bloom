#!/usr/bin/env node
/**
 * Universal Capacitor Version Synchronizer & Pre-Flight Guardrail Engine
 * Keeps package.json, android/app/build.gradle, and ios/App/App.xcodeproj/project.pbxproj
 * strictly in lockstep and enforces repository-specific AGENTS.md safety rules.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = process.cwd();
const pkgPath = path.join(projectRoot, 'package.json');
const gradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
const pbxprojPath = path.join(projectRoot, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
const capConfigTsPath = path.join(projectRoot, 'capacitor.config.ts');
const infoPlistPath = path.join(projectRoot, 'ios', 'App', 'App', 'Info.plist');
const androidStringsPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
const mainTsxPath = path.join(projectRoot, 'src', 'main.tsx');

function readCurrentVersions() {
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : { version: '0.0.0' };

  let androidVersionName = null;
  let androidVersionCode = null;
  if (fs.existsSync(gradlePath)) {
    const gradle = fs.readFileSync(gradlePath, 'utf8');
    const codeMatch = gradle.match(/versionCode\s+(\d+)/);
    const nameMatch = gradle.match(/versionName\s+["']([^"']+)["']/);
    if (codeMatch) androidVersionCode = parseInt(codeMatch[1], 10);
    if (nameMatch) androidVersionName = nameMatch[1];
  }

  let iosMarketingVersion = null;
  let iosBuildVersion = null;
  if (fs.existsSync(pbxprojPath)) {
    const pbx = fs.readFileSync(pbxprojPath, 'utf8');
    const mktMatch = pbx.match(/MARKETING_VERSION\s*=\s*([^;]+);/);
    const bldMatch = pbx.match(/CURRENT_PROJECT_VERSION\s*=\s*([^;]+);/);
    if (mktMatch) iosMarketingVersion = mktMatch[1].trim().replace(/^["']|["']$/g, '');
    if (bldMatch) iosBuildVersion = parseInt(bldMatch[1].trim(), 10);
  }

  return {
    web: { version: pkg.version },
    android: { versionName: androidVersionName, versionCode: androidVersionCode },
    ios: { marketingVersion: iosMarketingVersion, projectVersion: iosBuildVersion },
  };
}

function runGuardrails() {
  const errors = [];
  const capContent = fs.existsSync(capConfigTsPath) ? fs.readFileSync(capConfigTsPath, 'utf8') : '';
  const isOurPregnancy = capContent.includes('in.ourpregnancy.bloom');

  if (isOurPregnancy) {
    // Rule 4: Logo Protection
    try {
      const logoStatus = execSync('git status --porcelain public/logo.png branding/logos/ 2>/dev/null || true', {
        cwd: projectRoot,
        encoding: 'utf8',
      }).trim();
      if (logoStatus) {
        errors.push(`[AGENTS.md Rule #4 Violation] Uncommitted modifications detected in protected logo files:\n${logoStatus}`);
      }
    } catch {
      // Ignore if git is unavailable
    }

    // Rule 5: Sentry Initialization must remain disabled
    if (fs.existsSync(mainTsxPath)) {
      const mainTsx = fs.readFileSync(mainTsxPath, 'utf8');
      const uncommentedSentry = mainTsx
        .split('\n')
        .some((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*') && /Sentry\.init\s*\(/.test(line));
      if (uncommentedSentry) {
        errors.push(`[AGENTS.md Rule #5 Violation] Sentry.init() is active in src/main.tsx. It must remain commented out.`);
      }
    }

    // Rule 7: Brand Name Rule (Strict - public display name must be "Our Pregnancy", never "Bloom")
    if (fs.existsSync(infoPlistPath)) {
      const plist = fs.readFileSync(infoPlistPath, 'utf8');
      const displayMatch = plist.match(/<key>CFBundleDisplayName<\/key>\s*<string>([^<]+)<\/string>/);
      if (displayMatch && /bloom/i.test(displayMatch[1])) {
        errors.push(`[AGENTS.md Rule #7 Violation] iOS CFBundleDisplayName contains "Bloom": "${displayMatch[1]}". Must be "Our Pregnancy".`);
      }
    }
    if (fs.existsSync(androidStringsPath)) {
      const stringsXml = fs.readFileSync(androidStringsPath, 'utf8');
      const appNameMatch = stringsXml.match(/<string name="app_name">([^<]+)<\/string>/);
      if (appNameMatch && /bloom/i.test(appNameMatch[1])) {
        errors.push(`[AGENTS.md Rule #7 Violation] Android strings.xml app_name contains "Bloom": "${appNameMatch[1]}". Must be "Our Pregnancy".`);
      }
    }
  }

  return errors;
}

function updateVersions(targetVersion, targetBuild) {
  // 1. Update package.json
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = targetVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }

  // 2. Update android/app/build.gradle
  if (fs.existsSync(gradlePath)) {
    let gradle = fs.readFileSync(gradlePath, 'utf8');
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${targetBuild}`);
    gradle = gradle.replace(/versionName\s+["'][^"']+["']/, `versionName "${targetVersion}"`);
    fs.writeFileSync(gradlePath, gradle, 'utf8');
  }

  // 3. Update ios/App/App.xcodeproj/project.pbxproj
  if (fs.existsSync(pbxprojPath)) {
    let pbx = fs.readFileSync(pbxprojPath, 'utf8');
    pbx = pbx.replace(/MARKETING_VERSION\s*=\s*[^;]+;/g, `MARKETING_VERSION = ${targetVersion};`);
    pbx = pbx.replace(/CURRENT_PROJECT_VERSION\s*=\s*[^;]+;/g, `CURRENT_PROJECT_VERSION = ${targetBuild};`);
    fs.writeFileSync(pbxprojPath, pbx, 'utf8');
  }
}

const args = process.argv.slice(2);
const current = readCurrentVersions();

if (args.includes('--status') || args.includes('--check')) {
  console.log('====================================================');
  console.log('📊 CAPACITOR VERSION & PRE-FLIGHT STATUS');
  console.log('====================================================');
  console.log(`  • Web (package.json)        : v${current.web.version}`);
  console.log(`  • Android (build.gradle)    : v${current.android.versionName} (Build ${current.android.versionCode})`);
  console.log(`  • iOS (project.pbxproj)     : v${current.ios.marketingVersion} (Build ${current.ios.projectVersion})`);

  const guardrailErrors = runGuardrails();
  if (guardrailErrors.length > 0) {
    console.error('\n❌ GUARDRAIL VIOLATIONS:');
    guardrailErrors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log('  • AGENTS.md Guardrails      : ✅ PASSED');
  }

  const versionsMatch =
    current.web.version === current.android.versionName &&
    current.android.versionName === current.ios.marketingVersion &&
    current.android.versionCode === current.ios.projectVersion;

  if (!versionsMatch) {
    console.warn('\n⚠️  WARNING: Platform versions are out of sync!');
    if (args.includes('--strict')) process.exit(1);
  } else {
    console.log('  • Cross-Platform Parity     : ✅ SYNCHRONIZED');
  }
  console.log('====================================================');
  process.exit(0);
}

// Determine target version and build number
const highestCurrentBuild = Math.max(current.android.versionCode || 1, current.ios.projectVersion || 1);
let nextVersion = args[0] && !args[0].startsWith('--') ? args[0] : current.android.versionName || '1.0.0';
let nextBuild = args[1] && !args[1].startsWith('--') ? parseInt(args[1], 10) : highestCurrentBuild + 1;

if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(nextVersion)) {
  console.error(`❌ Invalid semantic version "${nextVersion}". Expected format: X.Y.Z (e.g., 1.1.0)`);
  process.exit(1);
}
if (Number.isNaN(nextBuild) || nextBuild < 1) {
  console.error(`❌ Invalid build number "${args[1]}". Expected positive integer.`);
  process.exit(1);
}

const guardrailErrors = runGuardrails();
if (guardrailErrors.length > 0) {
  console.error('❌ Aborting version sync due to guardrail violations:');
  guardrailErrors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

updateVersions(nextVersion, nextBuild);
const updated = readCurrentVersions();

console.log('====================================================');
console.log(`✅ VERSION SYNCHRONIZED TO v${nextVersion} (Build ${nextBuild})`);
console.log('====================================================');
console.log(`  • Web (package.json)        : v${updated.web.version}`);
console.log(`  • Android (build.gradle)    : v${updated.android.versionName} (versionCode ${updated.android.versionCode})`);
console.log(`  • iOS (project.pbxproj)     : v${updated.ios.marketingVersion} (CURRENT_PROJECT_VERSION ${updated.ios.projectVersion})`);
console.log('  • AGENTS.md Guardrails      : ✅ PASSED');
console.log('====================================================');
