const express = require("express");
const router = express.Router();

const adminProductController = require("../../controllers/admin/product.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");
const upload = require("../../middlewares/upload.middleware");

const {
  createProductValidator,
  updateProductValidator,
  deleteProductValidator
} = require("../../validators/product.validator");
const validateRequest = require("../../validators/validateRequest");

/**
 * @swagger
 * tags:
 *   name: Admin Products
 *   description: Admin product management
 */

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: View all products (Admin)
 *     tags: [Admin Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Products page rendered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/", authMiddleware, adminMiddleware, adminProductController.showProducts);

/**
 * @swagger
 * /admin/products/create:
 *   get:
 *     summary: Show create product page (Admin)
 *     tags: [Admin Products]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Create product page rendered
 */
router.get(
  "/create",
  authMiddleware,
  adminMiddleware,
  adminProductController.showCreateProduct
);

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product (Admin)
 *     tags: [Admin Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - qtyAvailable
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 example: iPhone 15
 *               price:
 *                 type: number
 *                 example: 999.99
 *               qtyAvailable:
 *                 type: integer
 *                 example: 10
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       302:
 *         description: Product created and redirected
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createProductValidator,
  validateRequest,
  adminProductController.createProduct
);

/**
 * @swagger
 * /admin/products/{id}/edit:
 *   get:
 *     summary: Show edit product page (Admin)
 *     tags: [Admin Products]
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
 *         description: Edit product page rendered
 *       404:
 *         description: Product not found
 */
router.get(
  "/:id/edit",
  authMiddleware,
  adminMiddleware,
  adminProductController.showEditProduct
);

/**
 * @swagger
 * /admin/products/{id}/update:
 *   post:
 *     summary: Update a product (Admin)
 *     tags: [Admin Products]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               qtyAvailable:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       302:
 *         description: Product updated and redirected
 *       400:
 *         description: Validation error
 */
router.post(
  "/:id/update",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateProductValidator,
  validateRequest,
  adminProductController.updateProduct
);

/**
 * @swagger
 * /admin/products/{id}/delete:
 *   post:
 *     summary: Delete a product (Admin)
 *     tags: [Admin Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       302:
 *         description: Product deleted and redirected
 *       404:
 *         description: Product not found
 */
router.post(
  "/:id/delete",
  authMiddleware,
  adminMiddleware,
  deleteProductValidator,
  validateRequest,
  adminProductController.deleteProduct
);

module.exports = router;
