document.addEventListener('DOMContentLoaded', function () {

  /* ── Tab switching ────────────────────────────────────────────── */
  const tabs       = document.querySelectorAll('.auth-tab');
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var entering = tab.dataset.tab === 'login' ? loginForm : signupForm;
      var leaving  = tab.dataset.tab === 'login' ? signupForm : loginForm;

      leaving.hidden  = true;
      entering.hidden = false;

      /* replay entrance animation */
      entering.style.animation = 'none';
      entering.offsetHeight;          /* force reflow */
      entering.style.animation = '';

      clearAllErrors();
    });
  });

  /* ── Password show / hide ─────────────────────────────────────── */
  document.querySelectorAll('.toggle-pw').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const input = btn.parentElement.querySelector('input');
      const icon  = btn.querySelector('i');
      const hide  = input.type === 'password';
      input.type  = hide ? 'text' : 'password';
      icon.classList.toggle('fa-eye',       !hide);
      icon.classList.toggle('fa-eye-slash',  hide);
    });
  });

  /* ── Error helpers ────────────────────────────────────────────── */
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  function clearAllErrors() {
    document.querySelectorAll('.field-error, .global-error').forEach(function (el) {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  /* Clear individual field error on input */
  document.querySelectorAll('.auth-form input').forEach(function (input) {
    input.addEventListener('input', function () {
      const errorEl = input.closest('.form-group') &&
        input.closest('.form-group').querySelector('.field-error');
      if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
    });
  });

  /* ── Login submission ─────────────────────────────────────────── */
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    showError('login-email-error',    '');
    showError('login-password-error', '');
    showError('login-global-error',   '');

    const email    = loginForm.querySelector('#login-email').value.trim();
    const password = loginForm.querySelector('#login-password').value;
    let valid = true;

    if (!email) {
      showError('login-email-error', 'Please enter your email address.');
      valid = false;
    } else if (!loginForm.querySelector('#login-email').validity.valid) {
      showError('login-email-error', 'Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      showError('login-password-error', 'Please enter your password.');
      valid = false;
    }

    if (!valid) return;

    const btn = loginForm.querySelector('.btn-auth');
    btn.disabled    = true;
    btn.textContent = 'Logging in…';

    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError('login-global-error', data.error || 'Login failed. Please try again.');
        btn.disabled    = false;
        btn.textContent = 'Log In';
        return;
      }

      window.location.href = '/';
    } catch {
      showError('login-global-error', 'Something went wrong. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'LOG IN';
    }
  });

  /* ── Signup submission ────────────────────────────────────────── */
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    showError('signup-name-error',    '');
    showError('signup-email-error',   '');
    showError('signup-password-error','');
    showError('signup-confirm-error', '');
    showError('signup-global-error',  '');

    const name            = signupForm.querySelector('#signup-name').value.trim();
    const email           = signupForm.querySelector('#signup-email').value.trim();
    const password        = signupForm.querySelector('#signup-password').value;
    const confirmPassword = signupForm.querySelector('#signup-confirm').value;
    let valid = true;

    if (!name) {
      showError('signup-name-error', 'Please enter your name.');
      valid = false;
    }

    if (!email) {
      showError('signup-email-error', 'Please enter your email address.');
      valid = false;
    } else if (!signupForm.querySelector('#signup-email').validity.valid) {
      showError('signup-email-error', 'Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      showError('signup-password-error', 'Please enter a password.');
      valid = false;
    } else if (password.length < 8) {
      showError('signup-password-error', 'Password must be at least 8 characters.');
      valid = false;
    }

    if (!confirmPassword) {
      showError('signup-confirm-error', 'Please confirm your password.');
      valid = false;
    } else if (password && confirmPassword !== password) {
      showError('signup-confirm-error', 'Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    const btn = signupForm.querySelector('.btn-auth');
    btn.disabled    = true;
    btn.textContent = 'Signing up…';

    try {
      const res  = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError('signup-global-error', data.error || 'Signup failed. Please try again.');
        btn.disabled    = false;
        btn.textContent = 'Sign Up';
        return;
      }

      window.location.href = '/';
    } catch {
      showError('signup-global-error', 'Something went wrong. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'Create Account';
    }
  });

});
