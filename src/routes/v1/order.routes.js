const express = require("express");
const router = express.Router();
const path = require("path");

const authMiddleware = require("../../middlewares/auth.middleware");
const orderController = require("../../controllers/v1/order.controller");
const { placeOrderValidator } = require("../../validators/order.validator");
const validateRequest = require("../../validators/validateRequest");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: User order management
 */

/**
 * @swagger
 * /v1/orders/data:
 *   get:
 *     summary: List current user's orders
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Orders list returned
 *       401:
 *         description: Unauthorized
 */
router.get("/data", authMiddleware, orderController.listOrders);

/**
 * @swagger
 * /v1/orders/data/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details returned
 *       404:
 *         description: Order not found or not accessible
 */
router.get("/data/:id", authMiddleware, orderController.showOrder);

/**
 * @swagger
 * /v1/orders:
 *   get:
 *     summary: Show orders page
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Orders page rendered
 */
router.get("/", authMiddleware, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/orders/index.html")
  );
});

/**
 * @swagger
 * /v1/orders/{id}:
 *   get:
 *     summary: Show single order page
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details page rendered
 */
router.get("/:id", authMiddleware, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/orders/show.html")
  );
});

/**
 * @swagger
 * /v1/orders:
 *   post:
 *     summary: Place an order from cart
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingName
 *               - shippingEmail
 *               - shippingPhone
 *               - shippingAddress
 *             properties:
 *               shippingName:
 *                 type: string
 *                 example: John Doe
 *               shippingEmail:
 *                 type: string
 *                 example: john@test.com
 *               shippingPhone:
 *                 type: string
 *                 example: 9876543210
 *               shippingAddress:
 *                 type: string
 *                 example: 123 Main Street, Chennai
 *     responses:
 *       302:
 *         description: Order placed and redirected
 *       400:
 *         description: Cart empty or validation error
 */
router.post(
  "/",
  authMiddleware,
  placeOrderValidator,
  validateRequest,
  orderController.placeOrder
);

module.exports = router;
