import { apiFetch } from "/js/api.js";

const token = new URLSearchParams(window.location.search).get("token");

document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");
  msg.innerText = "";

  try {
    const password = e.target.password.value;

    const result = await apiFetch("/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });

   
    msg.style.color = "green";
    msg.innerText = result.message;

   
    setTimeout(() => {
      window.location.href = "/v1/auth/login";
    }, 2000);

  } catch (err) {
    
    msg.style.color = "red";
    msg.innerText = err.message;
  }
});
