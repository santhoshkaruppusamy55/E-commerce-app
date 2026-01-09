const{User}=require("../../models");
const generateTokens = require("../../utils/generateToken");
const redisClient = require("../../config/redis.config");
const jwt=require("jsonwebtoken");
const path=require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const emailQueue = require("../../queues/email.queue");

exports.showRegister=(req,res)=>{
    res.sendFile(path.join(__dirname,"../../public/auth/register.html"));
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    await emailQueue.add("email", {
      type: "welcome",
      to: user.email,
      payload: { name: user.name }
    });

    return res.status(201).json({
      message: "Registration successful"
    });

  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    console.error("Register error:", err);
    return res.status(500).json({
      message: "Registration failed"
    });
  }
};


exports.showLogin=async(req,res)=>{
    res.sendFile(path.join(__dirname, "../../public/auth/login.html"));
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    const { accessToken, refreshToken, jti } = generateTokens(user);

    await redisClient.sadd(`user:${user.id}:sessions`, jti);
    await redisClient.expire(
      `user:${user.id}:sessions`,
      7 * 24 * 60 * 60
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    const isAdmin = Boolean(user.is_admin); 

    return res.status(200).json({
      message: "Login successful",
      redirect: isAdmin ? "/admin/products" : "/v1/products"
    });


  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};


exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;

    await redisClient.srem(`user:${req.user.id}:sessions`, req.user.jti);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.redirect("/v1/auth/login");

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send("Logout failed");
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.redirect("/v1/auth/login");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const isValid = await redisClient.sismember(
      `user:${decoded.sub}:sessions`,
      decoded.jti
    );

    if (!isValid) {
      return res.redirect("/v1/auth/login");
    }


    const newAccessToken = jwt.sign(
      {
        sub: decoded.sub,
        is_admin: Boolean(decoded.is_admin),
        jti: decoded.jti,
        type: "access"
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000
    });

    const redirectTo = req.headers.referer;
    return res.redirect(redirectTo);

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.redirect("/v1/auth/login");
  }
};


exports.showForgotPassword = (req, res) => {
  res.sendFile(
    require("path").join(__dirname, "../../public/auth/forgot-password.html")
  );
};

exports.showResetPassword = (req, res) => {
  res.sendFile(
    require("path").join(__dirname, "../../public/auth/reset-password.html")
  );
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });


  if (!user) {
    return res.json({
      message: "If the email exists, a reset link has been sent"
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await redisClient.set(
    `reset:${token}`,
    user.id,
    "EX",
    15 * 60
  );

  const resetLink = `http://localhost:3000/v1/auth/reset-password?token=${token}`;

  console.log("email queuing");
  await emailQueue.add("email", {
    type: "reset-password",
    to: user.email,
    payload: {
      resetLink
    }
  });

  console.log("email queued");

  res.json({
    message: "If the email exists, a reset link has been sent"
  });
};


exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const userId = await redisClient.get(`reset:${token}`);
    if (!userId) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.update(
      { password: hashed },
      { where: { id: userId } }
    );

    await redisClient.del(`reset:${token}`);

    return res.status(200).json({
      message: "Password reset successful"
    });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      message: "Failed to reset password"
    });
  }
};

