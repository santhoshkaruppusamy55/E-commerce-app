const { body, param } = require("express-validator");

exports.createProductValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body("qtyAvailable")
    .notEmpty()
    .withMessage("Available quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be 0 or more"),

  body("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isInt({ gt: 0 })
    .withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be text")
];

exports.updateProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ gt: 0 })
    .withMessage("Invalid product ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),

  body("qtyAvailable")
    .notEmpty()
    .withMessage("Available quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be 0 or more"),

  body("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isInt({ gt: 0 })
    .withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be text")
];

exports.deleteProductValidator = [
  param("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ gt: 0 })
    .withMessage("Invalid product ID")
];
