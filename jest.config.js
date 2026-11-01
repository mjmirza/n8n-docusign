module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/*.test.ts'],
	collectCoverageFrom: [
		'nodes/**/transport.ts',
		'nodes/**/utils/**/*.ts',
		'nodes/**/*.handler.ts',
		'!**/dist/**',
	],
	// Floor at the measured coverage so CI fails on a drop; raise it as tests are added.
	coverageThreshold: {
		global: {
			statements: 90,
			branches: 82,
			functions: 95,
			lines: 90,
		},
	},
};
