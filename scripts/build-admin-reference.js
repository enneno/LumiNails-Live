'use strict';

const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const {compile} = require('@tailwindcss/node');
const {Scanner} = require('@tailwindcss/oxide');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src/admin-reference');

async function buildReference() {
    const result = await esbuild.build({
        absWorkingDir: root,
        entryPoints: ['src/admin-reference/main.tsx'],
        outdir: root,
        entryNames: 'admin-reference',
        bundle: true,
        format: 'esm',
        jsx: 'automatic',
        target: ['es2022'],
        minify: true,
        write: false,
        metafile: true,
        alias: {'@':source,'next/image':path.join(source,'adapters/image.tsx'),'next/navigation':path.join(source,'adapters/navigation.ts')},
        define: {'process.env.NODE_ENV':'"production"'},
        logLevel: 'warning'
    });
    const compiler = await compile(fs.readFileSync(path.join(source, 'styles.css'), 'utf8'), {
        base:source,from:path.join(source,'styles.css'),onDependency(){}
    });
    const scanner = new Scanner({sources:[{base:source,pattern:'**/*.{ts,tsx}',negated:false}]});
    const utilityCss = compiler.build(scanner.scan());
    let changed = false;
    for (const file of result.outputFiles) {
        const contents = file.path.endsWith('.css') ? utilityCss + '\n' + file.text : file.text;
        if (fs.existsSync(file.path) && fs.readFileSync(file.path,'utf8') === contents) continue;
        changed = true;
        if (process.argv.includes('--check')) {
            console.error('STALE '+path.basename(file.path));
            process.exitCode=1;
        } else {
            fs.writeFileSync(file.path,contents);
            console.log('BUILT '+path.basename(file.path));
        }
    }
    if (!changed) console.log('OK copied reference UI build');
    // The dependency list is a local audit artifact, without environment files or data snapshots.
    if (!process.argv.includes('--check')) {
        fs.mkdirSync(path.join(root,'local-backups/admin-reference'),{recursive:true});
        fs.writeFileSync(path.join(root,'local-backups/admin-reference/build-inputs.json'),JSON.stringify(Object.keys(result.metafile.inputs),null,2));
    }
}

buildReference().catch(error=>{console.error(error.message);process.exitCode=1;});
