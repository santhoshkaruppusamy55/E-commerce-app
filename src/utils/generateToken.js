const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const generateTokens = (user) => {
  const jti = uuidv4();
  const isAdmin = Boolean(user.is_admin); 

  const accessToken = jwt.sign(
    {
      sub: user.id,
      is_admin: isAdmin,
      jti,
      type: "access"
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      is_admin: isAdmin,
      jti,
      type: "refresh"
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, jti };
};

module.exports = generateTokens;
