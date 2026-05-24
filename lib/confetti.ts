// Lightweight confetti effect using canvas — no dependencies

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = ['#f59e0b', '#f97316', '#ef4444', '#a855f7', '#3b82f6', '#22c55e', '#fbbf24'];

export function fireConfetti(options: { x?: number; y?: number; count?: number; spread?: number } = {}) {
  if (typeof window === 'undefined') return;

  const { x = window.innerWidth / 2, y = window.innerHeight / 2, count = 60, spread = 360 } = options;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }

  const particles: Particle[] = [];
  const angleStep = (spread / count) * (Math.PI / 180);
  const startAngle = ((360 - spread) / 2) * (Math.PI / 180);

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep + (Math.random() - 0.5) * 0.5;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(angle) * speed - Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 120;

  function animate() {
    if (!ctx) return;
    frame++;
    if (frame > maxFrames) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

export function fireWinConfetti() {
  fireConfetti({ y: window.innerHeight * 0.3, count: 80 });
}

export function firePurchaseConfetti() {
  fireConfetti({ count: 40, spread: 180 });
}
