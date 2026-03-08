export function launchConfetti(durationMs = 4000) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const palette = ['#69abbb','#fcf5bc','#a53080','#6462bb','#aa1f30','#c32934','#ffffff'];

  const pieces = Array.from({ length: 130 }, () => ({
    x:     Math.random() * canvas.width,
    y:    -10 - Math.random() * 120,
    w:     7 + Math.random() * 8,
    h:     4 + Math.random() * 5,
    color: palette[Math.floor(Math.random() * palette.length)],
    vx:   (Math.random() - 0.5) * 4,
    vy:    1.8 + Math.random() * 3,
    rot:   Math.random() * 360,
    vrot: (Math.random() - 0.5) * 7,
    opacity: 1,
  }));

  const start = performance.now();
  function draw(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
      if (elapsed > durationMs * 0.55) p.opacity = Math.max(0, p.opacity - 0.012);
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < durationMs) requestAnimationFrame(draw);
    else canvas.remove();
  }
  requestAnimationFrame(draw);
}

export function showPersonalRecordCelebration(count) {
  launchConfetti(4500);
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,.55);backdrop-filter:blur(6px);animation:fadeIn .3s ease both;
  `;
  el.innerHTML = `
    <div style="
      background:#1e3554;border:2px solid #69abbb;border-radius:24px;
      padding:40px 32px;text-align:center;max-width:300px;width:90%;
      animation:popIn .5s cubic-bezier(.34,1.56,.64,1) both;
    ">
      <div style="margin-bottom:16px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;color:var(--primary)"><path d="M8 21h8M12 17v4M7 4h10l1 7H6L7 4zM6 11h12v6H6z"/><path d="M9 4V2h6v2"/></svg></div>
      <div style="font-family:var(--font-display);font-weight:900;font-size:1rem;color:#fcf5bc;margin-bottom:8px;letter-spacing:.04em">
        НОВЫЙ РЕКОРД!
      </div>
      <div style="font-family:var(--font-display);font-size:2.8rem;font-weight:900;color:#69abbb;line-height:1;margin-bottom:8px">${count}</div>
      <div style="font-family:var(--font-body);color:rgba(255,255,255,.65);font-size:.875rem;margin-bottom:24px">
        артикулов за день — ты побил свой рекорд!
      </div>
      <button id="rec-ok" style="
        background:#69abbb;color:#1c314e;border:none;padding:13px 36px;
        border-radius:100px;font-family:var(--font-display);font-weight:700;
        cursor:pointer;font-size:.8rem;letter-spacing:.03em;
        transition:transform .15s;
      ">Отлично!</button>
    </div>`;
  document.body.appendChild(el);
  el.querySelector('#rec-ok').addEventListener('click', () => el.remove());
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
}
