module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  // Optional: Specify test match pattern
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  // Optional: Setup files
  setupFilesAfterEnv: ['./jest.setup.js']
};