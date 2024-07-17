/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.js'],
  verbose: true,
  // forceExit: true,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
};

module.exports = config;
