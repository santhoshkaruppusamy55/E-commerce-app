const express = require("express");
const path = require("path");
const router = express.Router();

const productController = require("../../controllers/v1/product.controller");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product listing and details
 */

/**
 * @swagger
 * /v1/products/api:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Products list returned
 */
router.get("/api", productController.listProducts);

/**
 * @swagger
 * /v1/products/api/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details returned
 *       404:
 *         description: Product not found
 */
router.get("/api/:id", productController.showProduct);

/**
 * @swagger
 * /v1/products:
 *   get:
 *     summary: Show products page
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products page rendered
 */
router.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/products/index.html")
  );
});

/**
 * @swagger
 * /v1/products/{id}:
 *   get:
 *     summary: Show single product page
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product page rendered
 */
router.get("/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../public/products/show.html")
  );
});

module.exports = router;
