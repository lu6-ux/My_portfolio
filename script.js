document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- mobile nav toggle ----
  const navToggle = document.querySelector('.navToggle');
  const navList = document.querySelector('#mainnav ul');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => navList.classList.toggle('open'));
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
  }

  // ---- active nav tracking on scroll ----
  const navLinks = Array.from(document.querySelectorAll('#mainnav a'));
  const sections = ['home', ...navLinks.map(a => a.dataset.target).filter(Boolean)]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navByTarget = Object.fromEntries(navLinks.map(a => [a.dataset.target, a]));
  const setActive = (id) => navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));

  if ('IntersectionObserver' in window) {
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => navIo.observe(s));
  }
  setActive('home');

  // ---- reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('visible'));
    }
  }

  // ---- stat counters ----
  const stats = document.querySelectorAll('.stat-box b[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && stats.length) {
    const statIo = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => { if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); } });
    }, { threshold: 0.5 });
    stats.forEach(s => statIo.observe(s));
  } else {
    stats.forEach(s => s.textContent = s.dataset.count);
  }

  // ---- back to top ----
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => { backBtn.style.display = (window.scrollY > 400) ? 'flex' : 'none'; });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  // ---- contact form (mailto fallback, no backend) ----
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const subject = encodeURIComponent('Portfolio contact from ' + name);
      const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:lakshanagnanasekaram29@gmail.com?subject=' + subject + '&body=' + body;
      status.textContent = 'message ready ✓ — opening your email app…';
    });
  }

  // ---- request card typing animation ----
  const reqText = document.getElementById('reqText');
  if (reqText) {
    const lines = [
      { t: 'POST ', c: '' }, { t: '/api/v1/inference', c: 's' },
      { t: '\n{\n  "model": ', c: '' }, { t: '"resume-matcher"', c: 's' },
      { t: ',\n  "status": ', c: '' }, { t: '"connected"', c: 's' },
      { t: ',\n  "latency_ms": ', c: '' }, { t: '42', c: 'k' },
      { t: '\n}', c: '' }
    ];
    if (reduceMotion) {
      reqText.innerHTML = lines.map(l => l.c ? `<span class="${l.c}">${l.t}</span>` : l.t).join('');
    } else {
      let li = 0, ci = 0, out = '';
      const typeNext = () => {
        if (li >= lines.length) { reqText.innerHTML = out; return; }
        const line = lines[li];
        if (ci < line.t.length) {
          ci++;
          const partial = line.t.slice(0, ci);
          reqText.innerHTML = out + (line.c ? `<span class="${line.c}">${partial}</span>` : partial) + '<span class="cur"></span>';
          setTimeout(typeNext, 16);
        } else {
          out += line.c ? `<span class="${line.c}">${line.t}</span>` : line.t;
          li++; ci = 0;
          setTimeout(typeNext, 40);
        }
      };
      setTimeout(typeNext, 500);
    }
  }

  // ---- hero node-graph canvas ----
  const canvas = document.getElementById('netCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];
    const NODE_COUNT = 16;
    const colors = ['rgba(255,122,89,', 'rgba(110,231,208,', 'rgba(246,242,234,'];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1.5 + Math.random() * 1.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(167,157,199,${(1 - dist / maxDist) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.fillStyle = n.color + '0.85)';
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function step() {
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });
      draw();
      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    initNodes();
    draw();
    if (!reduceMotion) requestAnimationFrame(step);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); initNodes(); draw(); }, 150);
    });
  }
});