const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    message:
      "Too many password reset attempts. Try after 10 minutes."
  }
});
