import mongoose from "mongoose";

/**
 * Task — a card on the board. Each task belongs to exactly one Category.
 *
 * The application doesn't use a separate `archived` flag — instead, "archived"
 * tasks live in the system-reserved Category named "Archived". The frontend
 * filters them out of the board view and shows them in a dedicated Archive
 * modal. This keeps the data model minimal and lets the existing PUT endpoint
 * handle archive/restore as ordinary `category_id` swaps.
 *
 * @typedef {Object} TaskDoc
 * @property {string}  _id          MongoDB ObjectId.
 * @property {string}  name         Required, trimmed, max 100 chars (controller-level rule).
 * @property {string}  description  Optional, trimmed, defaults to "".
 * @property {Date|null} deadline   Optional ISO date.
 * @property {"pending"|"done"} status  Defaults to "pending".
 * @property {string}  category_id  ObjectId reference to a Category.
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 */
const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
