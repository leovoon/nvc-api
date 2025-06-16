import { Database } from "bun:sqlite";

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

  constructor(filename: string = "exercises.db") {
    this.db = new Database(filename);
    this.initializeDatabase();
    this.seedDatabase();
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

  private seedDatabase() {
    const count = this.db
      .query("SELECT COUNT(*) as count FROM exercises")
      .get() as { count: number };

    if (count.count === 0) {
      const seedData: Omit<DatabaseExercise, "id">[] = [
        // Listening Barriers
        {
          type: "listening-barriers",
          name_en: "Advising",
          name_zh: "建议",
          description_en: "Giving advice or solutions without being asked",
          description_zh: "未经请求就给出建议或解决方案",
          example_en: "You should just talk to your boss about it.",
          example_zh: "你应该直接和你的老板谈谈。",
          nvc_alternative_en:
            "It sounds like you're feeling frustrated about the situation at work. Would you like to talk about what you're experiencing?",
          nvc_alternative_zh:
            "听起来你在工作中感到很沮丧。你想谈谈你的感受吗？",
          difficulty: "beginner",
          target_audience: "individual",
          related_exercises: JSON.stringify(["2", "3"]),
        },
        {
          type: "listening-barriers",
          name_en: "One-Upping",
          name_zh: "胜人一筹",
          description_en: "Sharing your own story to trump the other person",
          description_zh: "分享自己的故事以超越对方",
          example_en: "That's nothing, listen to what happened to me!",
          example_zh: "那不算什么，听听我的经历！",
          nvc_alternative_en:
            "That sounds like it had a big impact on you. Tell me more about how you're feeling.",
          nvc_alternative_zh: "这对你影响很大，再多说说你的感受吧。",
          difficulty: "beginner",
          target_audience: "individual",
          related_exercises: JSON.stringify(["1", "3"]),
        },
        {
          type: "listening-barriers",
          name_en: "Interrogating",
          name_zh: "盘问",
          description_en:
            "Asking questions to gather information rather than understand feelings",
          description_zh: "提问收集信息而不是理解感受",
          example_en:
            "When did this happen? Who was there? What exactly did they say?",
          example_zh: "这是什么时候发生的？谁在那里？他们到底说了什么？",
          nvc_alternative_en:
            "I can see this is important to you. How are you feeling about it?",
          nvc_alternative_zh: "我能看出这对你很重要。你对此有什么感受？",
          difficulty: "intermediate",
          target_audience: "individual",
          related_exercises: JSON.stringify(["1", "2"]),
        },
        // Observation vs Evaluation
        {
          type: "observation-evaluation",
          name_en: "Late Arrival",
          name_zh: "迟到",
          description_en:
            "Distinguishing between observing lateness and evaluating character",
          description_zh: "区分观察迟到和评判性格",
          scenario_en:
            "Someone arrives 15 minutes after the scheduled meeting time",
          scenario_zh: "有人在预定会议时间15分钟后到达",
          difficulty: "beginner",
          target_audience: "group",
        },
        {
          type: "observation-evaluation",
          name_en: "Incomplete Task",
          name_zh: "未完成任务",
          description_en: "Observing task completion without judgment",
          description_zh: "观察任务完成情况而不做判断",
          scenario_en:
            "A team member has not submitted their report by the agreed deadline",
          scenario_zh: "团队成员未在约定的截止日期前提交报告",
          difficulty: "beginner",
          target_audience: "group",
          related_exercises: JSON.stringify(["4"]),
        },
        // Feelings vs Thoughts
        {
          type: "feelings-thoughts",
          name_en: "Workplace Stress",
          name_zh: "工作压力",
          description_en:
            "Identifying genuine feelings vs thoughts disguised as feelings",
          description_zh: "识别真正的感受与伪装成感受的想法",
          scenario_en: "Dealing with overwhelming workload and tight deadlines",
          scenario_zh: "应对繁重的工作量和紧迫的截止日期",
          difficulty: "intermediate",
          target_audience: "individual",
        },
        // Needs vs Demands
        {
          type: "needs-demands",
          name_en: "Team Collaboration",
          name_zh: "团队合作",
          description_en:
            "Expressing needs for collaboration without making demands",
          description_zh: "表达合作需求而不提出要求",
          scenario_en:
            "Working on a project that requires input from multiple team members",
          scenario_zh: "从事需要多个团队成员参与的项目",
          difficulty: "intermediate",
          target_audience: "group",
        },
        // Requests
        {
          type: "requests",
          name_en: "Clear Communication",
          name_zh: "清晰沟通",
          description_en: "Making specific, doable requests",
          description_zh: "提出具体可行的请求",
          request_template_en: "Would you be willing to...?",
          request_template_zh: "你愿意……吗？",
          difficulty: "beginner",
          target_audience: "individual",
        },
        // Gratitude
        {
          type: "gratitude",
          name_en: "Appreciation Practice",
          name_zh: "感激练习",
          description_en: "Expressing gratitude in NVC format",
          description_zh: "以NVC格式表达感激",
          gratitude_expression_en:
            "I appreciate when you... because it meets my need for...",
          gratitude_expression_zh: "我感激你……因为这满足了我对……的需要",
          difficulty: "beginner",
          target_audience: "individual",
        },
        // Conflict Resolution
        {
          type: "conflict-resolution",
          name_en: "Mediation Process",
          name_zh: "调解过程",
          description_en: "Step-by-step conflict resolution using NVC",
          description_zh: "使用NVC的逐步冲突解决",
          steps_en: JSON.stringify([
            "Create a safe space for all parties",
            "Each person shares observations without evaluation",
            "Each person expresses their feelings",
            "Each person identifies their underlying needs",
            "Brainstorm solutions that meet everyone's needs",
          ]),
          steps_zh: JSON.stringify([
            "为各方创造安全空间",
            "每个人分享观察而不评判",
            "每个人表达自己的感受",
            "每个人识别潜在需求",
            "集思广益寻找满足每个人需求的解决方案",
          ]),
          difficulty: "advanced",
          target_audience: "group",
        },
      ];

      const insertStmt = this.db.prepare(`
        INSERT INTO exercises (
          type, name_en, name_zh, description_en, description_zh,
          difficulty, target_audience, related_exercises,
          scenario_en, scenario_zh, example_en, example_zh,
          nvc_alternative_en, nvc_alternative_zh,
          request_template_en, request_template_zh,
          gratitude_expression_en, gratitude_expression_zh,
          steps_en, steps_zh
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const exercise of seedData) {
        insertStmt.run(
          exercise.type,
          exercise.name_en,
          exercise.name_zh,
          exercise.description_en,
          exercise.description_zh,
          exercise.difficulty || null,
          exercise.target_audience || null,
          exercise.related_exercises || null,
          exercise.scenario_en || null,
          exercise.scenario_zh || null,
          exercise.example_en || null,
          exercise.example_zh || null,
          exercise.nvc_alternative_en || null,
          exercise.nvc_alternative_zh || null,
          exercise.request_template_en || null,
          exercise.request_template_zh || null,
          exercise.gratitude_expression_en || null,
          exercise.gratitude_expression_zh || null,
          exercise.steps_en || null,
          exercise.steps_zh || null,
        );
      }

      console.log("Database seeded with sample NVC exercises");
    }
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
