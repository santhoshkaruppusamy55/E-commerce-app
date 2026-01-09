module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,

  collectCoverageFrom: [
    "controllers/v1/**/*.js",
    "middlewares/auth.middleware.js",
    "!**/node_modules/**",
    "!**/controllers/admin/**",
    "!**/routes/**",
    "!**/models/**",
    "!**/config/**",
    "!**/queues/**",
    "!**/validators/**",
    "!**/utils/**"
  ],

  coverageDirectory: "coverage"
};
