// Jest 測試設置檔案
// 在所有測試執行前進行全局設置

// 模擬 console.log 來減少測試時的輸出干擾（可選）
global.console = {
  log: jest.fn(), // 模擬 console.log
  error: console.error, // 保留 error 輸出用於調試
  warn: console.warn, // 保留 warn 輸出
  info: console.info, // 保留 info 輸出
};

// 全局測試設置
beforeAll(() => {
  // 可以在這裡進行全局的測試前設置
  console.log('開始執行測試...');
});

afterAll(() => {
  // 可以在這裡進行全局的測試後清理
  console.log('ｓ測試執行完畢');
});
