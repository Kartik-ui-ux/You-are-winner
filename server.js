// ============================================
// WINNERS WEBSITE — Visitor Tracking Server
// Run: node server.js
// Logs every visitor's name to visitors.log
// ============================================

const http   = require('http');
const fs     = require('fs');
const path   = require('path');

const PORT       = 3000;
const LOG_FILE   = path.join(__dirname, 'visitors.log');
const PUBLIC_DIR = __dirname;

// ---- Ensure log file exists ----
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '=== WINNERS WEBSITE — Visitor Log ===\n\n', 'utf8');
}

// ---- MIME types ----
const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
};

// ---- Parse POST body ----
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end',  ()    => {
      try { resolve(JSON.parse(body)); }
      catch(_) { resolve({}); }
    });
  });
}

// ---- Read all visitors ----
function getVisitors() {
  const content = fs.readFileSync(LOG_FILE, 'utf8');
  const lines   = content.split('\n').filter(l => l.startsWith('['));
  return lines.map(l => {
    const match = l.match(/\[(.+?)\] Name: (.+?) \|/);
    return match ? { time: match[1], name: match[2] } : null;
  }).filter(Boolean);
}

// ---- HTTP Server ----
const server = http.createServer(async (req, res) => {

  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ---- POST /log-visitor ----
  if (req.method === 'POST' && req.url === '/log-visitor') {
    const body = await parseBody(req);
    const name = (body.name || 'Unknown').trim();
    const time = body.time || new Date().toISOString();
    const agent= (body.agent || '').substring(0, 80);

    const line = `[${time}] Name: ${name} | Agent: ${agent}\n`;
    fs.appendFileSync(LOG_FILE, line, 'utf8');

    console.log(`\n🏆 NEW VISITOR: ${name}`);
    console.log(`   Time  : ${time}`);
    console.log(`   Saved to visitors.log`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, name }));
    return;
  }

  // ---- GET /visitors ----
  if (req.method === 'GET' && req.url === '/visitors') {
    const visitors = getVisitors();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ count: visitors.length, visitors }));
    return;
  }

  // ---- STATIC FILES ----
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext    = path.extname(filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to index.html (SPA)
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(PUBLIC_DIR, 'index.html')).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🏆 WINNERS WEBSITE SERVER RUNNING');
  console.log('  ────────────────────────────────');
  console.log(`  URL     : http://localhost:${PORT}`);
  console.log(`  Log file: ${LOG_FILE}`);
  console.log('');
  console.log('  Every visitor name will appear here ↓');
  console.log('  ────────────────────────────────────\n');
});
