import { apiFetch } from "./api.js";

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");
  msg.innerText = "";

  const form = e.target;

  try {
    const result = await apiFetch("/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: form.email.value
      })
    });

    msg.innerText = result.message;

    setTimeout(() => {
      window.location.href = "/v1/auth/login";
    }, 3000);

  } catch (err) {
    msg.innerText = err.message;
  }
});
