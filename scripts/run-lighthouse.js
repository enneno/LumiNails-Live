const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const port = Number(process.env.LUMI_TEST_PORT || 8101);
const targetUrl = process.env.LUMI_LIGHTHOUSE_URL || `http://127.0.0.1:${port}/`;
const reportBase = path.join(projectRoot, 'test-results', 'lighthouse-home');
const reportHtml = `${reportBase}.report.html`;
const reportJson = `${reportBase}.report.json`;
const lighthouseTemp = path.join(projectRoot, 'test-results', '.lighthouse-temp');

function browserCandidates() {
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    return [
        process.env.CHROME_PATH,
        path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe')
    ].filter(Boolean);
}

function resolveBrowser() {
    return browserCandidates().find(candidate => fs.existsSync(candidate));
}

function waitForServer(url, timeoutMs = 15000) {
    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
        const check = async () => {
            try {
                const response = await fetch(url);
                if (response.ok) return resolve();
            } catch (_) {
                // A helyi szerver indulása közben várható.
            }
            if (Date.now() - startedAt >= timeoutMs) {
                return reject(new Error(`A helyi TEST szerver nem indult el: ${url}`));
            }
            setTimeout(check, 250);
        };
        check();
    });
}

function run(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], ...options });
        let output = '';
        child.stdout.on('data', chunk => { output += chunk; });
        child.stderr.on('data', chunk => { output += chunk; });
        child.once('error', reject);
        child.once('exit', code => {
            if (code === 0) resolve();
            else {
                const error = new Error(`A Lighthouse ${code} kilépési kóddal leállt.`);
                error.details = output.trim();
                reject(error);
            }
        });
    });
}

function reportsAreValid() {
    if (!fs.existsSync(reportHtml) || !fs.existsSync(reportJson)) return false;
    try {
        const report = JSON.parse(fs.readFileSync(reportJson, 'utf8'));
        return Boolean(report.fetchTime && report.categories && !report.runtimeError);
    } catch (_) {
        return false;
    }
}

async function removeLighthouseTemp() {
    await new Promise(resolve => setTimeout(resolve, 600));
    fs.rmSync(lighthouseTemp, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 400
    });
}

async function main() {
    const browserPath = resolveBrowser();
    if (!browserPath) {
        throw new Error('Nem található helyi Chrome vagy Edge. Állítsd be a CHROME_PATH változót.');
    }

    fs.mkdirSync(path.dirname(reportBase), { recursive: true });
    fs.rmSync(reportHtml, { force: true });
    fs.rmSync(reportJson, { force: true });
    fs.rmSync(lighthouseTemp, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
    fs.mkdirSync(lighthouseTemp, { recursive: true });

    let server;
    try {
        try {
            await waitForServer(targetUrl, 800);
        } catch (_) {
            server = spawn(process.execPath, ['scripts/static-server.js', '--port', String(port)], {
                cwd: projectRoot,
                stdio: 'inherit'
            });
            await waitForServer(targetUrl);
        }

        const lighthouseCli = path.join(projectRoot, 'node_modules', 'lighthouse', 'cli', 'index.js');
        try {
            await run(process.execPath, [
                lighthouseCli,
                targetUrl,
                '--quiet',
                '--output=html',
                '--output=json',
                `--output-path=${reportBase}`,
                '--only-categories=performance,accessibility,best-practices,seo',
                '--chrome-flags=--headless --no-sandbox'
            ], {
                cwd: projectRoot,
                env: {
                    ...process.env,
                    CHROME_PATH: browserPath,
                    TEMP: lighthouseTemp,
                    TMP: lighthouseTemp
                }
            });
        } catch (error) {
            if (!reportsAreValid()) {
                throw new Error([error.message, error.details].filter(Boolean).join('\n'));
            }
            console.warn('A Lighthouse-riport elkészült; a Windows Edge temp-profil takarítását a wrapper fejezi be.');
        }

        if (!reportsAreValid()) throw new Error('A Lighthouse nem készített érvényes HTML- és JSON-riportot.');

        console.log(`Lighthouse jelentések: ${path.relative(projectRoot, reportBase)}.report.html/.report.json`);
    } finally {
        if (server && !server.killed) server.kill();
        try {
            await removeLighthouseTemp();
        } catch (error) {
            console.warn(`A Lighthouse temp mappa később törölhető: ${error.message}`);
        }
    }
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
