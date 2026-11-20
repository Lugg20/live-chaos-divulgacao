// Servidor estático mínimo (sem dependências) só para a animação de divulgação.
// É um projeto SEPARADO do Live Chaos: não importa, não lê e não altera nenhum arquivo dele.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = process.env.PORT || 4000;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const send = (code, body, type = 'text/plain; charset=utf-8', extra = {}) => {
    res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', ...extra });
    res.end(req.method === 'HEAD' ? undefined : body);
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'Método não permitido', 'text/plain; charset=utf-8', { Allow: 'GET, HEAD' });

  let p;
  try { p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]); } catch { return send(400, 'Requisição inválida'); }
  if (p === '/health') return send(200, JSON.stringify({ ok: true, app: 'live-chaos-promo' }), 'application/json; charset=utf-8');
  if (p.includes('\0')) return send(400, 'Requisição inválida');

  let file = path.normalize(path.join(PUBLIC, p));
  if (file !== PUBLIC && !file.startsWith(PUBLIC + path.sep)) return send(403, 'Acesso negado');   // bloqueia ../
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { /* cai no 404 abaixo */ }

  fs.readFile(file, (err, data) => {
    if (err) return send(404, 'Arquivo não encontrado');
    const ext = path.extname(file).toLowerCase();
    send(200, data, MIME[ext] || 'application/octet-stream', { 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Animação de divulgação em http://localhost:${PORT}  (porta ${PORT})`));
