const { defineConfig } = require('playwright/test');

const testPort = Number(process.env.LUMI_TEST_PORT || 8101);
const staticDirectory = process.env.LUMI_TEST_DIST === '1' ? ' --dir dist' : '';

module.exports = defineConfig({
    testDir: './tests',
    testIgnore: [
        'unit/**',
        'admin-redesign-prototype.spec.js',
        'admin-redesign-prototype-drawer.spec.js'
    ],
    timeout: 30000,
    fullyParallel: false,
    reporter: [['list']],
    use: {
        baseURL: `http://127.0.0.1:${testPort}`,
        headless: true,
        channel: process.env.LUMI_BROWSER_CHANNEL || 'msedge',
        launchOptions: process.env.LUMI_BROWSER_EXECUTABLE ? { executablePath: process.env.LUMI_BROWSER_EXECUTABLE } : {},
        serviceWorkers: 'block',
        trace: 'retain-on-failure'
    },
    webServer: {
        command: `node scripts/static-server.js --port ${testPort}${staticDirectory}`,
        url: `http://127.0.0.1:${testPort}`,
        reuseExistingServer: true,
        timeout: 15000
    }
});
