const express = require("express");
const router = express.Router();

const authController = require("../../controllers/v1/auth.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const forgotPasswordLimiter = require("../../middlewares/forgotPasswordLimiter");

const {
  registerValidator,
  loginValidator,
  resetPasswordValidator
} = require("../../validators/auth.validator");
const validateRequest = require("../../validators/validateRequest");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization
 */


router.get("/register", authController.showRegister);

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  registerValidator,
  validateRequest,
  authController.register
);


router.get("/login", authController.showLogin);

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful (JWT set in cookie)
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  loginValidator,
  validateRequest,
  authController.login
);

/**
 * @swagger
 * /v1/auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Unauthorized
 */
router.get("/refresh", authController.refresh);

/**
 * @swagger
 * /v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authMiddleware, authController.logout);


router.get("/forgot-password", authController.showForgotPassword);

/**
 * @swagger
 * /v1/auth/forgot-password:
 *   post:
 *     summary: Send reset password email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 *       429:
 *         description: Too many requests
 */
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  authController.forgotPassword
);


router.get("/reset-password", authController.showResetPassword);

/**
 * @swagger
 * /v1/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Validation error
 */
router.post(
  "/reset-password",
  resetPasswordValidator,
  validateRequest,
  authController.resetPassword
);

module.exports = router;
