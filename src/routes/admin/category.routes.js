const express = require("express");
const router = express.Router();

const categoryController = require("../../controllers/admin/category.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin Categories
 *   description: Admin category management
 */

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: View all categories (Admin)
 *     tags: [Admin Categories]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Categories page rendered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  categoryController.showCategories
);

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a new category (Admin)
 *     tags: [Admin Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electronics
 *     responses:
 *       302:
 *         description: Category created and redirected
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  categoryController.createCategory
);

/**
 * @swagger
 * /admin/categories/{id}/delete:
 *   post:
 *     summary: Delete a category (Admin)
 *     tags: [Admin Categories]
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
 *         description: Category deleted and redirected
 *       404:
 *         description: Category not found
 */
router.post(
  "/:id/delete",
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory
);

module.exports = router;
