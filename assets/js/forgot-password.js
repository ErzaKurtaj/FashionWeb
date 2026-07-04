document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('forgot-form');

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    showError('forgot-email-error',  '');
    showError('forgot-global-error', '');

    const email = form.querySelector('#forgot-email').value.trim();
    let valid = true;

    if (!email) {
      showError('forgot-email-error', 'Please enter your email address.');
      valid = false;
    } else if (!form.querySelector('#forgot-email').validity.valid) {
      showError('forgot-email-error', 'Please enter a valid email address.');
      valid = false;
    }

    if (!valid) return;

    const btn = form.querySelector('.btn-auth');
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError('forgot-global-error', data.error || 'Something went wrong. Please try again.');
        btn.disabled    = false;
        btn.textContent = 'Send Reset Link';
        return;
      }

      const infoEl = document.getElementById('forgot-global-info');
      infoEl.textContent   = data.message;
      infoEl.style.display = 'block';
      btn.textContent      = 'Link Sent';
    } catch {
      showError('forgot-global-error', 'Something went wrong. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'Send Reset Link';
    }
  });
});
