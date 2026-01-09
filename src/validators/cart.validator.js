const { body, param } = require("express-validator");

exports.addItemValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ gt: 0 })
    .withMessage("Product ID must be a valid number"),

  body("qty")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be at least 1")
];

exports.updateItemValidator = [
  param("id")
    .notEmpty()
    .withMessage("Cart item id is required")
    .isInt({ gt: 0 })
    .withMessage("Cart item id must be a valid number"),

  body("qty")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be at least 1")
];

exports.removeItemValidator = [
  param("id")
    .notEmpty()
    .withMessage("Cart item id is required")
    .isInt({ gt: 0 })
    .withMessage("Cart item id must be a valid number")
];
