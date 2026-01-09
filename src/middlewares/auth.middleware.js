const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis.config");

const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.redirect("/v1/auth/login");
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const userId = decoded.sub;
    const tokenJti = decoded.jti;
    
    const isValid = await redisClient.sismember(
      `user:${userId}:sessions`,
      tokenJti
    );

    if (!isValid) {
      return res.redirect("/v1/auth/login");
    }

    req.user = {
      id: userId,
      is_admin: decoded.is_admin,
      jti: tokenJti
    };

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.redirect("/v1/auth/refresh");
    }

    return res.redirect("/v1/auth/login");
  }
};

module.exports = authMiddleware;


