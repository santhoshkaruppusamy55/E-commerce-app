import { apiFetch } from "./api.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const message = document.getElementById("message");
  message.innerText = "";

  try {
    const result = await apiFetch("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value
      })
    });

    window.location.href = result.redirect;

  } catch (err) {
    message.innerText = err.message;
  }
});
