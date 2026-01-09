export async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options
    });

    const data = await res.json().catch(() => ({}));

  
    if (data.errors) {
      const msg = data.errors.map(e => e.msg).join(", ");
      throw new Error(msg);
    }
    
    if((res.status === 401 || res.status === 403) && !url.startsWith("/v1/auth/login") &&
      !url.startsWith("/v1/auth/register")) {
      alert("Session expired. Please login again.");
      window.location.href = "/v1/auth/login";
      return;
    }

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;

  } catch (err) {
    alert(err.message || "Server error");
    throw err;
  }
}
