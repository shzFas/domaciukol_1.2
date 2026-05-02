import swaggerJsdoc from "swagger-jsdoc";

const port = process.env.PORT || 4444;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description:
        "REST API for a Trello-style task manager. Two resources — `Category` (board columns) and `Task` (cards inside columns). " +
        "The system seeds two reserved columns at startup: **Done** (auto-marks tasks as complete) and **Archived** (soft-delete bin). " +
        "These columns cannot be created, renamed, or deleted by clients.",
      contact: { name: "Task Manager" },
      license: { name: "ISC" },
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Categories",
        description: "Board columns. Two are reserved (Done, Archived).",
      },
      {
        name: "Tasks",
        description: "Cards. Each task belongs to exactly one category.",
      },
    ],
    components: {
      schemas: {
        Category: {
          type: "object",
          required: ["_id", "name"],
          properties: {
            _id: {
              type: "string",
              description: "MongoDB ObjectId",
              example: "65f1c2b8d3a1e4f0a1b2c3d4",
            },
            name: {
              type: "string",
              description:
                "Column name. Must be unique (case-insensitive). " +
                "Cannot equal a reserved name (`Done`, `Archived`).",
              example: "In Progress",
            },
            color: {
              type: "string",
              description: "Hex color (3- or 6-digit) used for the column dot.",
              example: "#1a73e8",
              pattern: "^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description:
                "Column name. Trimmed before storage. Cannot equal `Done` or `Archived` (case-insensitive). Must be unique.",
              example: "In Progress",
            },
            color: {
              type: "string",
              pattern: "^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$",
              example: "#1a73e8",
            },
          },
        },
        Task: {
          type: "object",
          required: ["_id", "name", "category_id"],
          properties: {
            _id: {
              type: "string",
              example: "65f1c2b8d3a1e4f0a1b2c3d5",
            },
            name: {
              type: "string",
              maxLength: 100,
              example: "Write README",
            },
            description: {
              type: "string",
              example: "Project documentation for GitHub repository",
            },
            deadline: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2026-04-10T00:00:00.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "done"],
              default: "pending",
              example: "pending",
            },
            category_id: {
              oneOf: [
                {
                  type: "string",
                  description: "Raw ObjectId (when not populated)",
                  example: "65f1c2b8d3a1e4f0a1b2c3d4",
                },
                {
                  type: "object",
                  description:
                    "Populated category reference (returned by GET endpoints)",
                  properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    color: { type: "string" },
                  },
                },
              ],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskInput: {
          type: "object",
          required: ["name", "category_id"],
          properties: {
            name: { type: "string", example: "Write README" },
            description: { type: "string", example: "Markdown overview" },
            deadline: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2026-04-10T00:00:00.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "done"],
              default: "pending",
            },
            category_id: {
              type: "string",
              description: "ObjectId of the parent Category",
              example: "65f1c2b8d3a1e4f0a1b2c3d4",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "Either a free-form error string, or an i18n-style code. " +
                "Known codes: `categoryNameDuplicate`, `categoryNameReserved`, " +
                "`categoryReservedReadOnly`, `invalidDtoIn`, `Category not found`, `Task not found`.",
              example: "categoryNameDuplicate",
            },
            errors: {
              type: "array",
              description: "Per-field validation errors (only for `invalidDtoIn`).",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "name" },
                  message: { type: "string", example: "name is required" },
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Validation failure or DB rejection.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                invalidDtoIn: {
                  summary: "express-validator rejection",
                  value: {
                    message: "invalidDtoIn",
                    errors: [
                      { field: "name", message: "name is required" },
                    ],
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: "Document with the given id does not exist.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { message: "Category not found" },
            },
          },
        },
        Conflict: {
          description:
            "Reserved-name or duplicate-name violation. " +
            "`message` is one of: `categoryNameDuplicate`, `categoryNameReserved`, `categoryReservedReadOnly`.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                duplicate: { value: { message: "categoryNameDuplicate" } },
                reserved: { value: { message: "categoryNameReserved" } },
                readOnly: { value: { message: "categoryReservedReadOnly" } },
              },
            },
          },
        },
        ServerError: {
          description: "Unexpected server / database failure.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: { message: "Ошибка сервера" },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/*.js",
    "./src/controllers/*.js",
    "./src/models/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
