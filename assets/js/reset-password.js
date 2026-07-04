document.addEventListener('DOMContentLoaded', function () {
  const form  = document.getElementById('reset-form');
  const token = new URLSearchParams(window.location.search).get('token');

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  if (!token) {
    showError('reset-global-error', 'This reset link is invalid or has expired.');
    form.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });
    return;
  }

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

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    showError('reset-password-error', '');
    showError('reset-confirm-error',  '');
    showError('reset-global-error',   '');

    const password        = form.querySelector('#reset-password').value;
    const confirmPassword = form.querySelector('#reset-confirm').value;
    let valid = true;

    if (!password) {
      showError('reset-password-error', 'Please enter a new password.');
      valid = false;
    } else if (password.length < 8) {
      showError('reset-password-error', 'Password must be at least 8 characters.');
      valid = false;
    }

    if (!confirmPassword) {
      showError('reset-confirm-error', 'Please confirm your new password.');
      valid = false;
    } else if (password && confirmPassword !== password) {
      showError('reset-confirm-error', 'Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    const btn = form.querySelector('.btn-auth');
    btn.disabled    = true;
    btn.textContent = 'Resetting…';

    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError('reset-global-error', data.error || 'Something went wrong. Please try again.');
        btn.disabled    = false;
        btn.textContent = 'Reset Password';
        return;
      }

      window.location.href = '/login.html?reset=1';
    } catch {
      showError('reset-global-error', 'Something went wrong. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'Reset Password';
    }
  });
});
