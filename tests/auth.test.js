const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const redisClient = require("../config/redis.config");

const { sequelize, User } = require("../models");

describe("Auth Integration Tests", () => {
  let user;

  beforeAll(async () => {
    await sequelize.authenticate();
  });

  beforeEach(async () => {
 
    await User.destroy({ where: {} });

    
    const keys = await redisClient.keys("user:*:sessions");
    if (keys.length) {
      await redisClient.del(keys);
    }
  });

  afterAll(async () => {
    await redisClient.quit();
    await sequelize.close();
  });


  describe("POST /v1/auth/register", () => {
    it("201 → registers a new user", async () => {
      const res = await request(app)
        .post("/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123"
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Registration successful");

      const createdUser = await User.findOne({
        where: { email: "test@example.com" }
      });

      expect(createdUser).not.toBeNull();
      expect(createdUser.name).toBe("Test User");
    });

    it("400 → duplicate email", async () => {
      await User.create({
        name: "User",
        email: "dup@example.com",
        password: "password123"
      });

      const res = await request(app)
        .post("/v1/auth/register")
        .send({
          name: "User 2",
          email: "dup@example.com",
          password: "password123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });
  });



  describe("POST /v1/auth/login", () => {
    beforeEach(async () => {
      user = await User.create({
        name: "Login User",
        email: "login@example.com",
        password: "password123"
      });
    });

    it("200 → login success and sets cookies", async () => {
      const res = await request(app)
        .post("/v1/auth/login")
        .send({
          email: "login@example.com",
          password: "password123"
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.redirect).toBe("/v1/products");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes("accessToken"))).toBe(true);
      expect(cookies.some(c => c.includes("refreshToken"))).toBe(true);

  
      const sessions = await redisClient.smembers(
        `user:${user.id}:sessions`
      );
      expect(sessions.length).toBe(1);
    });

    it("401 → invalid email", async () => {
      const res = await request(app)
        .post("/v1/auth/login")
        .send({
          email: "wrong@example.com",
          password: "password123"
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("401 → invalid password", async () => {
      const res = await request(app)
        .post("/v1/auth/login")
        .send({
          email: "login@example.com",
          password: "wrongpassword"
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid password");
    });
  });



  describe("POST /v1/auth/logout", () => {
    it("redirects to login and clears session", async () => {
      user = await User.create({
        name: "Logout User",
        email: "logout@example.com",
        password: "password123"
      });

      const jti = `jti-${Date.now()}`;
      const token = jwt.sign(
        { sub: user.id, jti },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      await redisClient.sadd(`user:${user.id}:sessions`, jti);

      const res = await request(app)
        .post("/v1/auth/logout")
        .set("Cookie", [`accessToken=${token}`]);

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/v1/auth/login");

      const sessions = await redisClient.smembers(
        `user:${user.id}:sessions`
      );
      expect(sessions.length).toBe(0);
    });
  });



  describe("POST /v1/auth/forgot-password", () => {
    it("200 → email exists", async () => {
      await User.create({
        name: "Forgot User",
        email: "forgot@example.com",
        password: "password123"
      });

      const res = await request(app)
        .post("/v1/auth/forgot-password")
        .send({ email: "forgot@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.message)
        .toBe("If the email exists, a reset link has been sent");
    });

    it("200 → email does not exist (no info leak)", async () => {
      const res = await request(app)
        .post("/v1/auth/forgot-password")
        .send({ email: "nouser@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.message)
        .toBe("If the email exists, a reset link has been sent");
    });
  });



  describe("POST /v1/auth/reset-password", () => {
    it("200 → valid token resets password", async () => {
      const user = await User.create({
        name: "Reset User",
        email: "reset@example.com",
        password: "oldpassword"
      });

      await redisClient.set("reset:valid-token", user.id);

      const res = await request(app)
        .post("/v1/auth/reset-password")
        .send({
          token: "valid-token",
          password: "newpassword123"
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset successful");
    });

    it("400 → invalid or expired token", async () => {
      const res = await request(app)
        .post("/v1/auth/reset-password")
        .send({
          token: "invalid-token",
          password: "newpassword123"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });
});
