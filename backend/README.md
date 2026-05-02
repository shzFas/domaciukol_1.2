# Task Manager — Backend

REST API for a Trello-style task manager. Built with **Express 5**, **Mongoose**,
**express-validator**, and documented with **Swagger / OpenAPI 3.0** via
`swagger-jsdoc` + `swagger-ui-express`.

---

## Tech stack

| Layer        | Library                              |
| ------------ | ------------------------------------ |
| Server       | Express 5                            |
| Database     | MongoDB (driver: Mongoose)           |
| Validation   | express-validator                    |
| API docs     | swagger-jsdoc + swagger-ui-express   |
| Tests        | Jest (with `--experimental-vm-modules`) |
| Dev reloader | `node --watch`                       |

ES modules — `package.json` declares `"type": "module"`.

---

## Project layout

```
backend/
├── index.js                     # Express bootstrap; mounts routes & Swagger UI
├── seed.js                      # One-shot seed script (full reset + sample data)
├── clear.js                     # One-shot script that drops all collections
├── src/
│   ├── config/
│   │   ├── db.js                # Mongoose connection bootstrap
│   │   └── swagger.js           # OpenAPI spec (info, schemas, responses)
│   ├── models/
│   │   ├── Category.js          # Mongoose schema for board columns
│   │   └── Task.js              # Mongoose schema for cards
│   ├── controllers/
│   │   ├── categoryController.js
│   │   ├── taskController.js
│   │   └── __tests__/           # Jest unit tests (mock Mongoose models)
│   ├── routes/
│   │   ├── categoryRoutes.js    # @swagger annotations live here
│   │   └── taskRoutes.js
│   └── validation/
│       ├── categoryValidation.js
│       └── taskValidation.js
└── README.md
```

---

## Running

```bash
# install once
npm install

# create .env (see below)
cp .env.example .env  # if you have one, or create manually

# dev (auto-reload via node --watch)
npm run dev

# prod
npm start

# tests
npm test
```

### Required env vars

```
MONGO_DB=mongodb+srv://…    # connection string
PORT=4444                   # optional, defaults to 4444
```

### Sample data

```bash
npm run seed         # wipe and insert categories + tasks
npm run seed:clear   # wipe everything
```

---

## API overview

Base URL: `http://localhost:4444/api`

| Method | Endpoint               | Description                                     |
| ------ | ---------------------- | ----------------------------------------------- |
| GET    | `/categories`          | List all columns (incl. system-reserved).       |
| POST   | `/categories`          | Create a column. 409 on reserved/duplicate name. |
| GET    | `/categories/:id`      | Single column.                                  |
| PUT    | `/categories/:id`      | Update a column. Reserved columns are read-only. |
| DELETE | `/categories/:id`      | Delete column + cascade delete its tasks.       |
| GET    | `/tasks`               | List tasks (`?category_id=…` to filter).        |
| POST   | `/tasks`               | Create a task.                                  |
| GET    | `/tasks/:id`           | Single task (with category populated).          |
| PUT    | `/tasks/:id`           | Update a task (used for move / status / archive). |
| DELETE | `/tasks/:id`           | Permanent delete.                               |
| GET    | `/docs`                | Swagger UI (interactive).                       |
| GET    | `/docs.json`           | Raw OpenAPI 3.0 JSON.                           |

### System categories

On startup, `ensureSystemCategories()` (in `categoryController.js`) creates two
columns if they don't exist:

- **Done** — moving a task here auto-marks it as `status: "done"`.
- **Archived** — soft-delete bin; the frontend hides this column via CSS and shows
  the contents in a dedicated Archive view.

These names are **reserved** — clients cannot create, rename to, or rename FROM
them. Attempts return `409` with one of:

- `categoryNameReserved` — tried to use a reserved name on create / rename-to.
- `categoryReservedReadOnly` — tried to rename or delete a reserved column.

### Validation errors

`express-validator` rejects malformed payloads with:

```json
{
  "message": "invalidDtoIn",
  "errors": [{ "field": "name", "message": "name is required" }]
}
```

### Move / archive flow

There is no separate archive endpoint — the frontend implements every "soft"
action through the regular `PUT /tasks/:id`:

| User action          | Wire-level effect                                 |
| -------------------- | ------------------------------------------------- |
| Drag to a column     | `category_id` change                              |
| Click ✓ on a card    | `category_id` → Done; `status` → done             |
| Click 🔄 (rework)    | Opens a "where to move?" dialog                   |
| Drop on trash zone   | `category_id` → Archived                          |
| Restore from archive | `category_id` → user-picked; `status` → pending   |
| Delete from archive  | `DELETE /tasks/:id`                               |

---

## Swagger UI

Once the server is running, open:

```
http://localhost:4444/api/docs
```

The spec is generated from JSDoc-style `@swagger` blocks in
`src/routes/*.js` plus the static schema definitions in `src/config/swagger.js`.
Anything you change in the routes/controllers is picked up on the next restart.

The raw JSON spec is at `/api/docs.json` — useful for importing into Postman or
generating client SDKs.

---

## Tests

```bash
npm test
```

31 unit tests across `categoryController` and `taskController`, all using
Jest's `unstable_mockModule` for Mongoose stubs (no real DB needed).

Coverage focuses on:

- Happy paths for create / read / update / delete.
- 404 when ids don't exist.
- 409 conflict paths (duplicate, reserved, read-only).
- 400 wrappers around Mongoose errors.
- Cascade delete of tasks when a category is removed.
