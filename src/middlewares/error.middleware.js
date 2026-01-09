module.exports = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  res.status(status).json({
    type: "server",
    message: err.message || "Something went wrong"
  });
};
