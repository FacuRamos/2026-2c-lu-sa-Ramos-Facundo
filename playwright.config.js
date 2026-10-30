import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/report', open: 'never' }],
  ],
  outputDir: './e2e/test-results',
  use: {
    baseURL: 'http://localhost:8081',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    video: {
      mode: 'on',
      size: { width: 390, height: 844 },
    },
    trace: 'on',
    screenshot: 'on',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'Mobile Emulation (iPhone / Chromium)',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        video: {
          mode: 'on',
          size: { width: 390, height: 844 },
        },
      },
    },
  ],
});
