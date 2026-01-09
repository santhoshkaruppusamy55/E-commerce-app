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
