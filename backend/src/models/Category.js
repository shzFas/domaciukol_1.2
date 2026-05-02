import mongoose from "mongoose";

/**
 * Category — a board column.
 *
 * Two columns are seeded automatically by `ensureSystemCategories` and protected
 * from create/rename/delete via HTTP:
 *
 *   - **Done**     — moving a task here auto-marks it as `status: "done"`.
 *   - **Archived** — soft-delete bin; tasks here are hidden from the board UI
 *                    but still queryable through the regular task endpoints.
 *
 * Uniqueness is enforced at the controller layer (case-insensitive), not at the
 * schema layer, because the seed flow needs idempotent inserts and the model
 * doesn't currently use a `unique` index.
 *
 * @typedef {Object} CategoryDoc
 * @property {string} _id        MongoDB ObjectId.
 * @property {string} name       Display name; required, trimmed.
 * @property {string} color      Hex color (`#RGB` or `#RRGGBB`); defaults to "#2E74B5".
 * @property {Date}   createdAt  Mongoose timestamp.
 * @property {Date}   updatedAt  Mongoose timestamp.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#2E74B5",
      trim: true,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
