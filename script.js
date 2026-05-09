/* ═══════════════════════════════════════════════════════════
   CHIAMAKA BLESSING — PORTFOLIO
   JavaScript: Starfield · Navbar · Animations · Form
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── Starfield Canvas ────────────────────────────────────────
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  let animFrame;
  const STAR_COUNT = 180;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      radius:  Math.random() * 1.2 + 0.2,
      opacity: Math.random() * 0.7 + 0.1,
      speed:   Math.random() * 0.015 + 0.005,
      phase:   Math.random() * Math.PI * 2,
      // Occasional green-tinted stars
      tint:    Math.random() > 0.85
    };
  }

  function buildStars() {
    stars = Array.from({ length: STAR_COUNT }, createStar);
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      const flicker = Math.sin(time * star.speed + star.phase);
      const opacity = star.opacity * (0.6 + 0.4 * flicker);

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

      if (star.tint) {
        ctx.fillStyle = `rgba(0, 200, 150, ${opacity * 0.8})`;
      } else {
        ctx.fillStyle = `rgba(200, 240, 230, ${opacity})`;
      }

      ctx.fill();
    });
  }

  let lastTime = 0;
  function animate(timestamp) {
    const delta = timestamp - lastTime;
    if (delta > 16) { // ~60fps cap
      drawStars(timestamp * 0.001);
      lastTime = timestamp;
    }
    animFrame = requestAnimationFrame(animate);
  }

  resize();
  buildStars();
  animate(0);

  window.addEventListener('resize', () => {
    resize();
    buildStars();
  });
})();


// ── Navbar: scroll effect + active link tracking ────────────
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const navLinks   = document.querySelectorAll('.nav-links a');
  const sections   = document.querySelectorAll('section[id]');
  const toggle     = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Scroll → add .scrolled class
  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  }

  // Highlight active nav link based on scroll position
  function updateActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight * 0.3;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  // Mobile menu toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();


// ── Scroll reveal: fade-in sections on scroll ───────────────
(function initReveal() {
  // Add reveal class to elements
  const targets = [
    '.about-grid',
    '.about-image-wrap',
    '.about-content',
    '.project-card',
    '.skill-card',
    '.comp-group',
    '.contact-info',
    '.contact-form',
    '.stat-card',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


// ── About photo: graceful fallback ──────────────────────────
(function initPhoto() {
  const img         = document.getElementById('aboutPhoto');
  const placeholder = document.getElementById('imgPlaceholder');

  if (!img || !placeholder) return;

  img.addEventListener('load', () => {
    img.classList.add('loaded');
    placeholder.style.display = 'none';
  });

  img.addEventListener('error', () => {
    // Keep showing placeholder if image fails
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  });

  // If image is already cached and loaded
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
    placeholder.style.display = 'none';
  }
})();


// ── Contact form: Formspree submission ──────────────────────
(function initForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const statusDiv  = document.getElementById('formStatus');
  const btnText    = submitBtn ? submitBtn.querySelector('.btn-text') : null;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI: loading state
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending...';
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';

    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        statusDiv.className = 'form-status success';
        statusDiv.textContent = '✓ Message sent! I\'ll get back to you soon.';
        form.reset();
      } else {
        const json = await response.json();
        throw new Error(json.error || 'Submission failed');
      }
    } catch (err) {
      statusDiv.className = 'form-status error';
      statusDiv.textContent = `✕ Something went wrong. Please email me directly at chimaxblessing4@gmail.com`;
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
    }
  });
})();


// ── Smooth scroll for all anchor links ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// ── Skill card: hover glow effect ──────────────────────────
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 12;
    card.style.transform = `translateY(-5px) rotateX(${-y}deg) rotateY(${x}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});


// ── Project card: parallax image on hover ──────────────────
document.querySelectorAll('.project-card').forEach(card => {
  const imgBg = card.querySelector('.project-img-bg');
  if (!imgBg) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
    imgBg.style.transform = `scale(1.03) translate(${x}px, ${y}px)`;
    imgBg.style.transition = 'transform 0.15s ease';
  });

  card.addEventListener('mouseleave', () => {
    imgBg.style.transform = '';
    imgBg.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});


// ── Footer year: auto update ─────────────────────────────
(function initFooterYear() {
  const yearEl = document.getElementById('currentYear');
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
})();