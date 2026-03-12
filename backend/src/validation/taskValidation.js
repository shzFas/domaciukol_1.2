import { body, validationResult } from "express-validator";

export const taskValidation = [
  body("name")
    .notEmpty().withMessage("name is required")
    .isString().withMessage("name must be a string")
    .trim(),

  body("description")
    .optional()
    .isString().withMessage("description must be a string")
    .trim(),

  body("deadline")
    .optional()
    .isISO8601().withMessage("deadline must be a valid date (ISO 8601)"),

  body("status")
    .optional()
    .isIn(["pending", "done"]).withMessage("status must be 'pending' or 'done'"),

  body("category_id")
    .notEmpty().withMessage("category_id is required")
    .isMongoId().withMessage("category_id must be a valid MongoDB ObjectId"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "invalidDtoIn",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];