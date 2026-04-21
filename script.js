/* ============================================
   WINNERS WEBSITE — JAVASCRIPT
   ============================================ */

// ---- PARTICLE SYSTEM ----
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = [
  'rgba(230,26,26,',
  'rgba(255,60,60,',
  'rgba(255,215,0,',
  'rgba(200,0,0,',
  'rgba(255,100,50,',
];

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + 10,
    size: Math.random() * 3 + 0.5,
    speedY: Math.random() * 1.2 + 0.3,
    speedX: (Math.random() - 0.5) * 0.6,
    life: 1,
    decay: Math.random() * 0.004 + 0.002,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    glow: Math.random() > 0.7,
  };
}

for (let i = 0; i < 80; i++) {
  const p = createParticle();
  p.y = Math.random() * canvas.height;
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.y -= p.speedY;
    p.x += p.speedX;
    p.life -= p.decay;

    if (p.glow) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color + '0.8)';
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color + p.life + ')';
    ctx.fill();

    if (p.life <= 0 || p.y < -10) {
      particles[i] = createParticle();
    }
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ---- LIVE DATE ----
function updateDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const el = document.getElementById('live-date');
  if (el) el.textContent = now.toLocaleDateString('en-US', opts);
}
updateDate();
setInterval(updateDate, 1000);

// ---- ENTER SITE ----
function enterSite() {
  const input = document.getElementById('visitor-name');
  const name = input.value.trim();

  if (!name) {
    input.style.borderColor = '#ff0000';
    input.style.boxShadow = '0 0 20px rgba(255,0,0,0.6)';
    input.placeholder = '⚠️ Champion, enter your name!';
    setTimeout(() => {
      input.style.borderColor = 'rgba(230,26,26,0.5)';
      input.style.boxShadow = '';
      input.placeholder = 'Your name...';
    }, 1400);
    return;
  }

  // Show name on site
  document.getElementById('display-name').textContent = name;

  // Log visitor to backend
  logVisitor(name);

  // Transition
  const modal = document.getElementById('name-modal');
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.6s ease';
  setTimeout(() => {
    modal.classList.add('hidden');
    const main = document.getElementById('main-site');
    main.classList.remove('hidden');
    setTimeout(() => main.classList.add('visible'), 20);
  }, 600);
}

// ---- ENTER ON KEYPRESS ----
document.getElementById('visitor-name').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enterSite();
});

// ---- PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ----
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxqdzLQU3JdAZdO-Y8LoIq-tUqMyc1biJafF7UppFCgt3zLDqvoFGw2UsWyrWvzKbJXHw/exec';

// ---- LOG VISITOR TO GOOGLE SHEETS ----
async function logVisitor(name) {
  if (!SHEET_URL || SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
    console.warn('[Winners] Google Sheet URL not set. See setup instructions.');
    return;
  }
  try {
    // no-cors because Apps Script redirect causes CORS error — data still arrives
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        time: new Date().toISOString(),
        agent: navigator.userAgent.substring(0, 100),
      }),
    });
  } catch (err) {
    console.warn('[Winners] Could not reach Google Sheet:', err);
  }
}

