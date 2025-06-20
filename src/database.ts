import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

export interface TranslatedText {
  en: string;
  zh: string;
}

export interface NVCExercise {
  id: string;
  type:
    | "observation-evaluation"
    | "feelings-thoughts"
    | "needs-demands"
    | "listening-barriers"
    | "requests"
    | "gratitude"
    | "conflict-resolution";
  name: TranslatedText;
  description: TranslatedText;
  difficulty?: "beginner" | "intermediate" | "advanced";
  targetAudience?: "individual" | "group";
  relatedExercises?: string[];
  // Type-specific fields
  scenario?: TranslatedText;
  example?: TranslatedText;
  nvcAlternative?: TranslatedText;
  requestTemplate?: TranslatedText;
  gratitudeExpression?: TranslatedText;
  steps?: TranslatedText[];
}

export interface DatabaseExercise {
  id: number;
  type: string;
  name_en: string;
  name_zh: string;
  description_en: string;
  description_zh: string;
  difficulty?: string;
  target_audience?: string;
  related_exercises?: string;
  scenario_en?: string;
  scenario_zh?: string;
  example_en?: string;
  example_zh?: string;
  nvc_alternative_en?: string;
  nvc_alternative_zh?: string;
  request_template_en?: string;
  request_template_zh?: string;
  gratitude_expression_en?: string;
  gratitude_expression_zh?: string;
  steps_en?: string;
  steps_zh?: string;
}

class NVCDatabase {
  private db: Database;

  constructor(filename?: string) {
    const dbPath =
      filename ||
      process.env.DATABASE_PATH ||
      (process.env.NODE_ENV === "production"
        ? "/app/data/exercises.db"
        : "./data/exercises.db");

    // Ensure the data directory exists
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(dbPath, { create: true });
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        name_en TEXT NOT NULL,
        name_zh TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_zh TEXT NOT NULL,
        difficulty TEXT,
        target_audience TEXT,
        related_exercises TEXT,
        scenario_en TEXT,
        scenario_zh TEXT,
        example_en TEXT,
        example_zh TEXT,
        nvc_alternative_en TEXT,
        nvc_alternative_zh TEXT,
        request_template_en TEXT,
        request_template_zh TEXT,
        gratitude_expression_en TEXT,
        gratitude_expression_zh TEXT,
        steps_en TEXT,
        steps_zh TEXT
      )
    `);
  }

  getAllExercises(
    filters: {
      type?: string;
      difficulty?: string;
      targetAudience?: string;
    } = {},
  ): DatabaseExercise[] {
    let sql = "SELECT * FROM exercises";
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.type) {
      conditions.push("type = ?");
      params.push(filters.type);
    }

    if (filters.difficulty) {
      conditions.push("difficulty = ?");
      params.push(filters.difficulty);
    }

    if (filters.targetAudience) {
      conditions.push("target_audience = ?");
      params.push(filters.targetAudience);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    return this.db.query(sql).all(...params) as DatabaseExercise[];
  }

  getExerciseById(id: string): DatabaseExercise | null {
    const exercise = this.db
      .query("SELECT * FROM exercises WHERE id = ?")
      .get(id) as DatabaseExercise;
    return exercise || null;
  }

  transformToNVCExercise(
    dbExercise: DatabaseExercise,
    lang?: string,
  ): NVCExercise {
    const exercise: any = {
      id: dbExercise.id.toString(),
      type: dbExercise.type as NVCExercise["type"],
      name: lang
        ? lang === "zh"
          ? dbExercise.name_zh
          : dbExercise.name_en
        : { en: dbExercise.name_en, zh: dbExercise.name_zh },
      description: lang
        ? lang === "zh"
          ? dbExercise.description_zh
          : dbExercise.description_en
        : { en: dbExercise.description_en, zh: dbExercise.description_zh },
      difficulty: dbExercise.difficulty as NVCExercise["difficulty"],
      targetAudience:
        dbExercise.target_audience as NVCExercise["targetAudience"],
      relatedExercises: dbExercise.related_exercises
        ? JSON.parse(dbExercise.related_exercises)
        : undefined,
    };

    // Add type-specific fields
    if (dbExercise.scenario_en && dbExercise.scenario_zh) {
      exercise.scenario = lang
        ? lang === "zh"
          ? dbExercise.scenario_zh
          : dbExercise.scenario_en
        : { en: dbExercise.scenario_en, zh: dbExercise.scenario_zh };
    }

    if (dbExercise.example_en && dbExercise.example_zh) {
      exercise.example = lang
        ? lang === "zh"
          ? dbExercise.example_zh
          : dbExercise.example_en
        : { en: dbExercise.example_en, zh: dbExercise.example_zh };
    }

    if (dbExercise.nvc_alternative_en && dbExercise.nvc_alternative_zh) {
      exercise.nvcAlternative = lang
        ? lang === "zh"
          ? dbExercise.nvc_alternative_zh
          : dbExercise.nvc_alternative_en
        : {
            en: dbExercise.nvc_alternative_en,
            zh: dbExercise.nvc_alternative_zh,
          };
    }

    if (dbExercise.request_template_en && dbExercise.request_template_zh) {
      exercise.requestTemplate = lang
        ? lang === "zh"
          ? dbExercise.request_template_zh
          : dbExercise.request_template_en
        : {
            en: dbExercise.request_template_en,
            zh: dbExercise.request_template_zh,
          };
    }

    if (
      dbExercise.gratitude_expression_en &&
      dbExercise.gratitude_expression_zh
    ) {
      exercise.gratitudeExpression = lang
        ? lang === "zh"
          ? dbExercise.gratitude_expression_zh
          : dbExercise.gratitude_expression_en
        : {
            en: dbExercise.gratitude_expression_en,
            zh: dbExercise.gratitude_expression_zh,
          };
    }

    if (dbExercise.steps_en && dbExercise.steps_zh) {
      const stepsEn = JSON.parse(dbExercise.steps_en);
      const stepsZh = JSON.parse(dbExercise.steps_zh);

      if (lang) {
        exercise.steps = lang === "zh" ? stepsZh : stepsEn;
      } else {
        exercise.steps = stepsEn.map((step: string, i: number) => ({
          en: step,
          zh: stepsZh[i],
        }));
      }
    }

    return exercise as NVCExercise;
  }

  close() {
    this.db.close();
  }
}

export const nvcDatabase = new NVCDatabase();
