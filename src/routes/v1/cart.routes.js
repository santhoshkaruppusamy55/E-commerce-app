const express = require("express");
const path = require("path");
const router = express.Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const cartController = require("../../controllers/v1/cart.controller");
const {
  addItemValidator,
  updateItemValidator,
  removeItemValidator
} = require("../../validators/cart.validator");
const validateRequest = require("../../validators/validateRequest");

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User cart management
 */

/**
 * @swagger
 * /v1/cart/data:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart data returned
 *       401:
 *         description: Unauthorized
 */
router.get("/data", authMiddleware, cartController.getCart);
router.get("/count",authMiddleware,cartController.getCount);
/**
 * @swagger
 * /v1/cart:
 *   get:
 *     summary: Show cart page
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart page rendered
 */
router.get("/", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/cart/index.html"));
});

/**
 * @swagger
 * /v1/cart/items:
 *   get:
 *     summary: Show checkout page
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Checkout page rendered
 */
router.get("/items", authMiddleware, (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/orders/checkout.html")
  );
});

/**
 * @swagger
 * /v1/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - qty
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               qty:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Product not found
 */
router.post(
  "/items",
  authMiddleware,
  addItemValidator,
  validateRequest,
  cartController.addItem
);

/**
 * @swagger
 * /v1/cart/items/{id}:
 *   patch:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qty
 *             properties:
 *               qty:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Cart item not found
 */
router.patch(
  "/items/:id",
  authMiddleware,
  updateItemValidator,
  validateRequest,
  cartController.updateItem
);

/**
 * @swagger
 * /v1/cart/items/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Item removed from cart
 *       404:
 *         description: Cart item not found
 */
router.delete(
  "/items/:id",
  authMiddleware,
  removeItemValidator,
  validateRequest,
  cartController.removeItem
);

module.exports = router;
