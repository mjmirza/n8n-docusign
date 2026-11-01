// Runs n8n's community-node verification lint on the source and on the packed tarball,
// so CI fails before publishing anything n8n would reject. Usage: npm run lint:n8n
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Pinned to the version n8n uses for verification. Installed apart from the project with
// --ignore-scripts: its eslint plugin has a pnpm-only preinstall guard that breaks npm installs.
const SCANNER = '@n8n/scan-community-package@0.41.1';

const root = process.cwd();
const work = mkdtempSync(join(tmpdir(), 'n8n-scan-'));
let failed = false;

try {
	const tools = join(work, 'tools');
	execFileSync('npm', ['install', '--prefix', tools, '--ignore-scripts', '--no-audit', '--no-fund', SCANNER], {
		stdio: 'ignore',
	});
	const scannerPath = join(tools, 'node_modules/@n8n/scan-community-package/scanner/scanner.mjs');
	const { analyzePackage, SOURCE_FILE_PATTERNS } = await import(pathToFileURL(scannerPath).href);

	const source = await analyzePackage(root, SOURCE_FILE_PATTERNS);
	console.log(`source: ${source.passed ? 'PASS' : 'FAIL'}`);
	if (!source.passed) {
		console.log(source.message ?? '', source.details ?? '');
		failed = true;
	}

	const packDir = join(work, 'pack');
	execFileSync('npm', ['pack', '--pack-destination', work], { stdio: 'ignore' });
	const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'));
	execFileSync('mkdir', ['-p', packDir]);
	execFileSync('tar', ['-xzf', join(work, tarball), '-C', packDir]);
	const dist = await analyzePackage(join(packDir, 'package'));
	console.log(`package: ${dist.passed ? 'PASS' : 'FAIL'}`);
	if (!dist.passed) {
		console.log(dist.message ?? '', dist.details ?? '');
		failed = true;
	}
} finally {
	rmSync(work, { recursive: true, force: true });
}

process.exit(failed ? 1 : 0);
