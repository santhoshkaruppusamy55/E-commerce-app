const { body } = require("express-validator");

exports.placeOrderValidator = [
  body("shippingName")
    .trim()
    .notEmpty()
    .withMessage("Shipping name is required")
    .isLength({ min: 2 })
    .withMessage("Shipping name must be at least 2 characters"),

  body("shippingEmail")
    .trim()
    .notEmpty()
    .withMessage("Shipping email is required")
    .isEmail()
    .withMessage("Invalid shipping email"),

  body("shippingPhone")
    .trim()
    .notEmpty()
    .withMessage("Shipping phone is required")
    .isLength({ min: 10, max: 15 })
    .withMessage("Invalid phone number"),

  body("shippingAddress")
    .trim()
    .notEmpty()
    .withMessage("Shipping address is required")
    .isLength({ min: 10 })
    .withMessage("Shipping address must be at least 10 characters")
];
