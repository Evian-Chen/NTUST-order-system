module.exports = {
  // 測試環境
  testEnvironment: 'node',
  
  // 測試檔案的匹配模式
  testMatch: [
    '**/test/**/*.test.js',
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/*.(test|spec).js'
  ],
  
  // 設置測試超時時間 (毫秒)
  testTimeout: 10000,
  
  // 在每個測試檔案執行前運行的設置檔案
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // 覆蓋率報告設定
  collectCoverage: false, // 可以設為 true 來啟用覆蓋率報告
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 要包含在覆蓋率報告中的檔案
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/coverage/**'
  ],
  
  // 忽略的檔案模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // 模組檔案擴展名
  moduleFileExtensions: ['js', 'json'],
  
  // 詳細模式 - 顯示每個測試的結果
  verbose: true
};
