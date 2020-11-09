module.exports = {
  testTimeout: 30000,
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  rootDir: '.',
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', '<rootDir>/src/migration', '<rootDir>/src/config', '<rootDir>/src/main.ts', '<rootDir>/test', '<rootDir>/dist'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testRegex: '.spec.ts$',
};
