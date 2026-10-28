import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist'));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.txt': 'text/plain' };
http.createServer((request, response) => {
  try {
    let name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile() || !fs.realpathSync(file).startsWith(root + path.sep)) {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(path.join(root, '404.html')).pipe(response);
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
    fs.createReadStream(file).pipe(response);
  } catch { response.writeHead(400).end('Bad request'); }
}).listen(8118, '127.0.0.1', () => console.log('Design preview: http://127.0.0.1:8118'));
