document.addEventListener('DOMContentLoaded', () => {
  // year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile nav toggle
  const navToggle = document.querySelector('.navToggle');
  const navList = document.querySelector('#mainnav ul');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => navList.classList.toggle('open'));
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
  }

  // active nav link based on current page
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#mainnav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  // back to top
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.style.display = (window.scrollY > 300) ? 'flex' : 'none';
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  // stat count-up
  const statNums = document.querySelectorAll('.stat-box .num[data-count]');
  if (statNums.length) {
    const animateNum = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const tick = () => {
        current += step;
        if (current >= target) { el.textContent = target + suffix; return; }
        el.textContent = current + suffix;
        requestAnimationFrame(tick);
      };
      tick();
    };
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateNum(entry.target); statIo.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => statIo.observe(el));
  }

  // contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('emailField').value.trim();
      if (!name || !email) { alert('Please enter your name and email.'); return; }
      const note = document.getElementById('sentNote');
      note.style.display = 'block';
      setTimeout(() => note.style.display = 'none', 3000);
      e.target.reset();
    });
  }

  // typed role rotator (home page only)
  const typedEl = document.getElementById('typed');
  if (typedEl && window.Typed) {
    new Typed('#typed', {
      strings: ["AI Enthusiast", "Machine Learning Explorer", "Backend Developer Intern"],
      typeSpeed: 65, backSpeed: 35, backDelay: 1400, loop: true, showCursor: false
    });
  }
});