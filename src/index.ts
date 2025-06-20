import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { nvcDatabase } from "./database";

// Authentication middleware
const authMiddleware = async (context: any) => {
  const authHeader = context.headers.authorization;

  if (!authHeader) {
    context.set.status = 401;
    return { error: "Missing Authorization header" };
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  const apiKey = await nvcDatabase.validateApiKey(token);

  if (!apiKey) {
    context.set.status = 401;
    return { error: "Invalid API key" };
  }

  // Add API key info to context for potential use in handlers
  context.apiKey = apiKey;
  return;
};

const app = new Elysia()
  .use(cors())
  .get("/", () => ({ message: "NVC Exercises API v1", status: "running" }))

  // GET /exercises - List exercises with optional filtering
  .get("/exercises", async ({ query, set, headers }) => {
    // Apply authentication
    const authResult = await authMiddleware({ headers, set });
    if (authResult) return authResult;
    try {
      const { type, lang, difficulty, targetAudience } = query;

      // Validate language parameter
      if (lang && !["en", "zh"].includes(lang as string)) {
        set.status = 400;
        return { error: "Invalid language. Use 'en' or 'zh'." };
      }

      // Validate type parameter
      const validTypes = [
        "observation-evaluation",
        "feelings-thoughts",
        "needs-demands",
        "listening-barriers",
        "requests",
        "gratitude",
        "conflict-resolution",
      ];

      if (type && !validTypes.includes(type as string)) {
        set.status = 400;
        return {
          error: `Invalid type. Valid types are: ${validTypes.join(", ")}`,
        };
      }

      // Validate difficulty parameter
      const validDifficulties = ["beginner", "intermediate", "advanced"];
      if (difficulty && !validDifficulties.includes(difficulty as string)) {
        set.status = 400;
        return {
          error: `Invalid difficulty. Valid difficulties are: ${validDifficulties.join(", ")}`,
        };
      }

      // Validate targetAudience parameter
      const validAudiences = ["individual", "group"];
      if (
        targetAudience &&
        !validAudiences.includes(targetAudience as string)
      ) {
        set.status = 400;
        return {
          error: `Invalid target audience. Valid audiences are: ${validAudiences.join(", ")}`,
        };
      }

      // Get exercises from database
      const dbExercises = nvcDatabase.getAllExercises({
        type: type as string,
        difficulty: difficulty as string,
        targetAudience: targetAudience as string,
      });

      // Transform to API format
      const exercises = dbExercises.map((ex) =>
        nvcDatabase.transformToNVCExercise(ex, lang as string | undefined),
      );

      return exercises;
    } catch (error) {
      console.error("Error fetching exercises:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  })

  // GET /exercises/:id - Get single exercise by ID
  .get("/exercises/:id", async ({ params, query, set, headers }) => {
    // Apply authentication
    const authResult = await authMiddleware({ headers, set });
    if (authResult) return authResult;
    try {
      const { id } = params;
      const { lang } = query;

      // Validate language parameter
      if (lang && !["en", "zh"].includes(lang as string)) {
        set.status = 400;
        return { error: "Invalid language. Use 'en' or 'zh'." };
      }

      // Validate ID format (should be numeric for our auto-increment IDs)
      if (!/^\d+$/.test(id)) {
        set.status = 400;
        return { error: "Invalid exercise ID format" };
      }

      // Get exercise from database
      const dbExercise = nvcDatabase.getExerciseById(id);

      if (!dbExercise) {
        set.status = 404;
        return { error: "Exercise not found" };
      }

      // Transform to API format
      const exercise = nvcDatabase.transformToNVCExercise(
        dbExercise,
        lang as string | undefined,
      );

      return exercise;
    } catch (error) {
      console.error("Error fetching exercise:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  })

  // Health check endpoint (public)
  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  }))

  // API Key management endpoints (for admin use)
  .post("/admin/api-keys", async ({ body, set }) => {
    try {
      const { name } = body as { name: string };

      if (!name || typeof name !== "string") {
        set.status = 400;
        return { error: "Name is required" };
      }

      const result = await nvcDatabase.createApiKey(name);
      return {
        message: "API key created successfully",
        apiKey: result.key,
        id: result.id,
      };
    } catch (error) {
      console.error("Error creating API key:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  })

  .get("/admin/api-keys", ({ set }) => {
    try {
      const apiKeys = nvcDatabase.getAllApiKeys();
      // Don't return the actual keys, just metadata
      return apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        is_active: key.is_active,
        created_at: key.created_at,
        last_used: key.last_used,
      }));
    } catch (error) {
      console.error("Error fetching API keys:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  })

  .delete("/admin/api-keys/:id", ({ params, set }) => {
    try {
      const { id } = params;
      const success = nvcDatabase.deactivateApiKey(parseInt(id));

      if (!success) {
        set.status = 404;
        return { error: "API key not found" };
      }

      return { message: "API key deactivated successfully" };
    } catch (error) {
      console.error("Error deactivating API key:", error);
      set.status = 500;
      return { error: "Internal server error" };
    }
  })

  // 404 handler for unmatched routes
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Endpoint not found" };
    }

    console.error("Unhandled error:", error);
    set.status = 500;
    return { error: "Internal server error" };
  })

  .listen(3000);

console.log(
  `🦊 NVC Exercises API is running at ${app.server?.hostname}:${app.server?.port}`,
);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  nvcDatabase.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  nvcDatabase.close();
  process.exit(0);
});
