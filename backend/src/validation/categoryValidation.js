import { body, validationResult } from "express-validator";

/**
 * `categoryValidation` — Express middleware chain for POST/PUT /api/categories.
 *
 * Rules:
 *   - `name`  → required, string, trimmed.
 *   - `color` → optional, string, must match a hex color regex (`#RGB` or `#RRGGBB`).
 *
 * On any rule failure, responds 400 with shape:
 *   { message: "invalidDtoIn", errors: [{ field, message }, ...] }
 *
 * Higher-level rules (uniqueness, reserved names, system-column protection) are
 * enforced in the controller, not here.
 */
export const categoryValidation = [
  body("name")
    .notEmpty().withMessage("name is required")
    .isString().withMessage("name must be a string")
    .trim(),

  body("color")
    .optional()
    .isString().withMessage("color must be a string")
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage("color must be a valid hex color")
    .trim(),

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
