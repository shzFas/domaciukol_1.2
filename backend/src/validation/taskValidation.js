import { body, validationResult } from "express-validator";

/**
 * `taskValidation` — Express middleware chain for POST/PUT /api/tasks.
 *
 * Rules:
 *   - `name`        → required, non-empty string, trimmed.
 *   - `description` → optional string, trimmed.
 *   - `deadline`    → optional, ISO-8601 date string.
 *   - `status`      → optional, one of "pending" | "done".
 *   - `category_id` → required, valid MongoDB ObjectId.
 *
 * On rule failure, responds 400:
 *   { message: "invalidDtoIn", errors: [{ field, message }, ...] }
 *
 * The middleware does NOT check that `category_id` actually points to an existing
 * Category — that responsibility is left to Mongoose / the database layer.
 */
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
