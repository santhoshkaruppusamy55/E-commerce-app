import { apiFetch } from "./api.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const message = document.getElementById("message");
  message.innerText = "";

  try {
    await apiFetch("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        password: form.password.value
      })
    });

    alert("Registration successful");
    window.location.href = "/v1/auth/login";

  } catch (err) {
    message.innerText = err.message;
  }
});

// Password visibility toggle (non-intrusive, keeps existing form logic)
(function setupPasswordToggle() {
  const form = document.getElementById("registerForm");
  if (!form) return;
  const pwd = form.querySelector('input[name="password"]');
  if (!pwd) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'password-toggle';
  btn.setAttribute('aria-label', 'Toggle password visibility');

  const eyeOpen = '<svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeSlash = '<svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.79 20.79 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/></svg>';

  // initial icon: password is hidden, show eye-slash (indicates hidden)
  btn.innerHTML = eyeSlash;

  btn.addEventListener('click', () => {
    if (pwd.type === 'password') {
      pwd.type = 'text';
      btn.innerHTML = eyeOpen;
    } else {
      pwd.type = 'password';
      btn.innerHTML = eyeSlash;
    }
  });

  if (pwd.parentNode) {
    pwd.parentNode.appendChild(btn);
  }
})();
