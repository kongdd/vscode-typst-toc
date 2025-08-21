import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Check if we're running with coverage
		const isCoverage = process.env.COVERAGE === 'true' || process.argv.includes('--coverage');

		// Download VS Code, unzip it and run the integration test
		await runTests({ 
			extensionDevelopmentPath, 
			extensionTestsPath,
			// Add coverage-related launch args
			launchArgs: [
				'--disable-extensions',
				'--disable-workspace-trust',
				...(isCoverage ? ['--enable-source-maps'] : [])
			],
			// Set environment variables for coverage
			extensionTestsEnv: {
				...process.env,
				...(isCoverage ? {
					COVERAGE: 'true',
					NODE_V8_COVERAGE: path.resolve(__dirname, '../../coverage/tmp')
				} : {})
			}
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
