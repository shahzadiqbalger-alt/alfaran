/* =====================================================
   AL FARAN TRAVEL & TOURS — MAIN JAVASCRIPT
   ===================================================== */

'use strict';

/* ── Navbar: Background change on scroll ─────────────── */
const navbar = document.getElementById('mainNavbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Back to Top visibility
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
});

/* ── Smooth Scroll for Nav Links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const offset = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile nav if open
    const navCollapse = document.getElementById('navbarNav');
    if (navCollapse.classList.contains('show')) {
      new bootstrap.Collapse(navCollapse).hide();
    }
  });
});

/* ── Active Nav Link on Scroll ───────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

const observerOptions = { rootMargin: '-40% 0px -55% 0px' };

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

/* ── Back To Top Button ──────────────────────────────── */
const backToTopBtn = document.getElementById('backToTop');

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Animated Counters ───────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const step = Math.ceil(target / (duration / 16));
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString();
  }, 16);
}

const counters = document.querySelectorAll('.counter-num');
let countersStarted = false;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      counters.forEach(counter => animateCounter(counter));
    }
  });
}, { threshold: 0.3 });

const whySection = document.getElementById('why');
if (whySection) counterObserver.observe(whySection);

/* ── Contact Form Validation ─────────────────────────── */
const contactForm  = document.getElementById('contactForm');
const formAlert    = document.getElementById('formAlert');
const nameInput    = document.getElementById('fullName');
const phoneInput   = document.getElementById('phone');
const emailInput   = document.getElementById('email');

function showAlert(type, message) {
  formAlert.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i>
      <span>${message}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validateName(val) {
  return val.trim().length >= 3;
}

function validatePhone(val) {
  return /^[0-9\-\+\s]{7,15}$/.test(val.trim());
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function setFieldState(input, valid) {
  input.classList.remove('is-valid', 'is-invalid');
  input.classList.add(valid ? 'is-valid' : 'is-invalid');
}

// Real-time inline validation
nameInput.addEventListener('input', () => setFieldState(nameInput, validateName(nameInput.value)));
phoneInput.addEventListener('input', () => setFieldState(phoneInput, validatePhone(phoneInput.value)));
emailInput.addEventListener('input', () => setFieldState(emailInput, validateEmail(emailInput.value)));

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameOk  = validateName(nameInput.value);
  const phoneOk = validatePhone(phoneInput.value);
  const emailOk = validateEmail(emailInput.value);

  setFieldState(nameInput,  nameOk);
  setFieldState(phoneInput, phoneOk);
  setFieldState(emailInput, emailOk);

  if (!nameOk || !phoneOk || !emailOk) {
    showAlert('danger', 'Please fill in all required fields correctly before submitting.');
    return;
  }

  const submitBtn = contactForm.querySelector('[type="submit"]');
  const originalHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Sending...`;

  // Build form payload
  const payload = {
    name:        document.getElementById('fullName').value.trim(),
    phone:       document.getElementById('phone').value.trim(),
    email:       document.getElementById('email').value.trim(),
    destination: document.getElementById('destination').value,
    travelDate:  document.getElementById('travelDate').value,
    travelers:   document.getElementById('travelers').value,
    message:     document.getElementById('message').value.trim(),
  };

  try {
    const response = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      showAlert('success', data.message);
      contactForm.reset();
      contactForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
    } else {
      showAlert('danger', data.message || 'Something went wrong. Please call us directly.');
    }
  } catch (err) {
    showAlert('danger', 'Network error. Please call us at 0334-3044483.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHtml;
  }
});

/* ── Scroll-reveal fade-in for cards ─────────────────── */
const revealEls = document.querySelectorAll(
  '.service-card, .dest-card, .why-card, .counter-box, .about-image-wrapper, .contact-info-box, .contact-form-box'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Add initial hidden state
revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  revealObserver.observe(el);
});

// When revealed
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
});

/* ── Navbar link highlight on page load ──────────────── */
window.addEventListener('load', () => {
  // Trigger initial scroll check
  window.dispatchEvent(new Event('scroll'));
});
