# Non-Violent Communication (NVC) Exercises API

This API provides access to non-violent communication (NVC) exercises, categorized into types such as observation-evaluation, feelings-thoughts, needs-demands, listening-barriers, requests, gratitude, and conflict-resolution. Exercises support multilingual content (English and Chinese) and include metadata like difficulty and target audience. The API is designed for use with Bun and a database (e.g., SQLite) that generates unique IDs for each exercise.

## Base URL
`https://api.nvc-exercises.example.com/v1`

## Data Structure

### NVCExercise
Represents a single NVC exercise with the following fields:

- **id**: `string` (Database-generated, e.g., `"1"`, `"2"`, or UUID)
- **type**: `string` (Enum: `"observation-evaluation"`, `"feelings-thoughts"`, `"needs-demands"`, `"listening-barriers"`, `"requests"`, `"gratitude"`, `"conflict-resolution"`)
- **name**: `object` (Translated name, e.g., `{ "en": "Advising", "zh": "建议" }`)
- **description**: `object` (Translated description, e.g., `{ "en": "Giving advice without being asked", "zh": "未经请求就给出建议或解决方案" }`)
- **difficulty**: `string` (Optional, Enum: `"beginner"`, `"intermediate"`, `"advanced"`)
- **targetAudience**: `string` (Optional, Enum: `"individual"`, `"group"`)
- **relatedExercises**: `string[]` (Optional, Array of exercise IDs, e.g., `["2", "3"]`)

#### Type-Specific Fields
- **observation-evaluation**, **feelings-thoughts**, **needs-demands**:
  - **scenario**: `object` (Optional, Translated scenario, e.g., `{ "en": "Someone arrives late to a meeting", "zh": "有人开会迟到" }`)
- **listening-barriers**:
  - **example**: `object` (Translated example, e.g., `{ "en": "You should talk to your boss", "zh": "你应该和老板谈谈" }`)
  - **nvcAlternative**: `object` (Translated NVC alternative, e.g., `{ "en": "Sounds like you're frustrated...", "zh": "听起来你很沮丧..." }`)
- **requests**:
  - **requestTemplate**: `object` (Translated request template, e.g., `{ "en": "Would you be willing to...?", "zh": "你愿意……吗？" }`)
- **gratitude**:
  - **gratitudeExpression**: `object` (Translated gratitude expression, e.g., `{ "en": "I appreciate...", "zh": "我感激..." }`)
- **conflict-resolution**:
  - **steps**: `object[]` (Optional, Array of translated steps, e.g., `[{ "en": "Step 1...", "zh": "第一步..." }]`)

## Endpoints

### GET /exercises
Retrieve a list of exercises, optionally filtered by type or language.

#### Query Parameters
- **type**: `string` (Optional, Filter by exercise type, e.g., `"listening-barriers"`)
- **lang**: `string` (Optional, Language for text fields: `"en"` or `"zh"`. Defaults to `"en"`)
- **difficulty**: `string` (Optional, Filter by difficulty: `"beginner"`, `"intermediate"`, `"advanced"`)
- **targetAudience**: `string` (Optional, Filter by audience: `"individual"`, `"group"`)

#### Response
- **Status**: `200 OK`
- **Body**: `NVCExercise[]` (Array of exercises, with text fields returned in the requested language if specified)

#### Example Request
```
GET /exercises?type=listening-barriers&lang=zh
```

#### Example Response
```json
[
  {
    "id": "1",
    "type": "listening-barriers",
    "name": "建议",
    "description": "未经请求就给出建议或解决方案",
    "example": "你应该直接和你的老板谈谈。",
    "nvcAlternative": "听起来你在工作中感到很沮丧。你想谈谈你的感受吗？",
    "difficulty": "beginner",
    "targetAudience": "individual",
    "relatedExercises": ["2", "3"]
  },
  {
    "id": "2",
    "type": "listening-barriers",
    "name": "胜人一筹",
    "description": "分享自己的故事以超越对方",
    "example": "那不算什么，听听我的经历！",
    "nvcAlternative": "这对你影响很大，再多说说你的感受吧。",
    "difficulty": "beginner",
    "targetAudience": "individual",
    "relatedExercises": ["1", "3"]
  }
]
```

#### Error Responses
- **400 Bad Request**: Invalid query parameters (e.g., `lang=invalid`)
  ```json
  { "error": "Invalid language. Use 'en' or 'zh'." }
  ```
- **500 Internal Server Error**: Server-side issue
  ```json
  { "error": "Internal server error" }
  ```

### GET /exercises/:id
Retrieve a single exercise by its database-generated ID.

#### Path Parameters
- **id**: `string` (Database-generated ID, e.g., `"1"`)

#### Query Parameters
- **lang**: `string` (Optional, Language for text fields: `"en"` or `"zh"`. Defaults to `"en"`)

#### Response
- **Status**: `200 OK`
- **Body**: `NVCExercise` (Single exercise, with text fields in the requested language)

#### Example Request
```
GET /exercises/1?lang=en
```

#### Example Response
```json
{
  "id": "1",
  "type": "listening-barriers",
  "name": "Advising",
  "description": "Giving advice or solutions without being asked",
  "example": "You should just talk to your boss about it.",
  "nvcAlternative": "It sounds like you're feeling frustrated about the situation at work. Would you like to talk about what you're experiencing?",
  "difficulty": "beginner",
  "targetAudience": "individual",
  "relatedExercises": ["2", "3"]
}
```

#### Error Responses
- **404 Not Found**: Exercise with specified ID does not exist
  ```json
  { "error": "Exercise not found" }
  ```
- **400 Bad Request**: Invalid language
  ```json
  { "error": "Invalid language. Use 'en' or 'zh'." }
  ```
- **500 Internal Server Error**: Server-side issue
  ```json
  { "error": "Internal server error" }
  ```

## Notes
- **Multilingual Support**: When `lang` is specified, text fields (`name`, `description`, etc.) return only a string in the requested language (e.g., `"Advising"` instead of `{ "en": "Advising", "zh": "建议" }`). If `lang` is omitted, the full object with all languages is returned.
- **Database-Generated IDs**: IDs are generated by the database (e.g., auto-incrementing integers or UUIDs). Clients should treat them as opaque strings.
- **Bun Implementation**: The API can be implemented using Bun with SQLite. Use `bun:sqlite` for database operations and validate data with libraries like Zod.
- **Extensibility**: The structure supports additional exercise types (e.g., `requests`, `gratitude`) and fields (e.g., `videoUrl` for multimedia).

## Example Implementation (Bun)
Below is a sample Bun server snippet for the `/exercises` endpoint:

```javascript
import { Database } from 'bun:sqlite';
import cors from '@elysiajs/cors';
import { Elysia } from 'elysia';

const db = new Database('exercises.db');
const app = new Elysia()
  .use(cors())
  .get('/exercises', ({ query }) => {
    const { type, lang = 'en', difficulty, targetAudience } = query;
    let sql = 'SELECT * FROM exercises';
    const params = [];
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    if (difficulty) {
      sql += params.length ? ' AND difficulty = ?' : ' WHERE difficulty = ?';
      params.push(difficulty);
    }
    if (targetAudience) {
      sql += params.length ? ' AND target_audience = ?' : ' WHERE target_audience = ?';
      params.push(targetAudience);
    }
    const exercises = db.query(sql).all(...params);
    return exercises.map(ex => ({
      id: ex.id.toString(),
      type: ex.type,
      name: lang ? ex[`name_${lang}`] : { en: ex.name_en, zh: ex.name_zh },
      description: lang ? ex[`description_${lang}`] : { en: ex.description_en, zh: ex.description_zh },
      ...(ex.type === 'listening-barriers' && {
        example: lang ? ex[`example_${lang}`] : { en: ex.example_en, zh: ex.example_zh },
        nvcAlternative: lang ? ex[`nvc_alternative_${lang}`] : { en: ex.nvc_alternative_en, zh: ex.nvc_alternative_zh }
      }),
      ...(ex.scenario_en && {
        scenario: lang ? ex[`scenario_${lang}`] : { en: ex.scenario_en, zh: ex.scenario_zh }
      }),
      ...(ex.request_template_en && {
        requestTemplate: lang ? ex[`request_template_${lang}`] : { en: ex.request_template_en, zh: ex.request_template_zh }
      }),
      ...(ex.gratitude_expression_en && {
        gratitudeExpression: lang ? ex[`gratitude_expression_${lang}`] : { en: ex.gratitude_expression_en, zh: ex.gratitude_expression_zh }
      }),
      ...(ex.steps_en && {
        steps: JSON.parse(ex.steps_en).map((step, i) => (lang ? step : { en: step, zh: JSON.parse(ex.steps_zh)[i] }))
      }),
      difficulty: ex.difficulty,
      targetAudience: ex.target_audience,
      relatedExercises: ex.related_exercises ? JSON.parse(ex.related_exercises) : undefined
    }));
  })
  .listen(3000);
```

## Error Codes
- **400 Bad Request**: Invalid query or path parameters.
- **404 Not Found**: Requested resource not found.
- **500 Internal Server Error**: Unexpected server error.

## Future Enhancements
- Add endpoints for creating/updating exercises (`POST /exercises`, `PUT /exercises/:id`).
- Support additional languages by extending the database schema.
- Include multimedia fields (e.g., `videoUrl`) for richer content.
- Add pagination for large datasets (`limit`, `offset` query parameters).

## References
- [Non-Violent Communication Guide](https://positivepsychology.com/non-violent-communication/)
- [Bun SQLite Documentation](https://bun.sh/docs/api/sqlite)
- [Elysia.js for Bun](https://elysiajs.com/)