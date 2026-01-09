const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).send("Access denied");
  }
  next();
};

module.exports = adminMiddleware;
