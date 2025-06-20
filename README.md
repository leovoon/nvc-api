# NVC Exercises API

A RESTful API for Non-Violent Communication (NVC) exercises, built with Bun and Elysia.js. This API provides multilingual access to various NVC exercises including observation vs evaluation, feelings vs thoughts, needs vs demands, listening barriers, requests, gratitude, and conflict resolution exercises.

## Features

- **API Key Authentication**: Secure access with API key-based authentication
- **Multilingual Support**: English and Chinese translations
- **Exercise Categories**: 7 different types of NVC exercises
- **Filtering**: Filter by type, difficulty, and target audience
- **SQLite Database**: Lightweight, file-based storage
- **CORS Enabled**: Ready for web applications
- **Type Safety**: Built with TypeScript

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   bun install
   ```

3. Initialize the database:
   ```bash
   bun run init-db
   ```

4. Create an API key:
   ```bash
   bun run api-keys create "My App"
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3000`

## Authentication

This API uses API key-based authentication. You must include a valid API key in the `Authorization` header for all requests except health checks.

### API Key Format
```
Authorization: Bearer nvc_your_api_key_here
```

### Creating API Keys
```bash
# Create a new API key
bun run api-keys create "My Application"

# List all API keys
bun run api-keys list

# Deactivate an API key
bun run scripts/manage_api_keys.ts deactivate 1
```

## API Reference

### Base URL
```
http://localhost:3000
```

### Endpoints

#### GET /exercises

Retrieve a list of exercises with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by exercise type
- `lang` (optional): Language for responses (`en` or `zh`)
- `difficulty` (optional): Filter by difficulty (`beginner`, `intermediate`, `advanced`)
- `targetAudience` (optional): Filter by audience (`individual`, `group`)

**Example Requests:**
```bash
# Get all exercises
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  http://localhost:3000/exercises

# Get listening barrier exercises in Chinese
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises?type=listening-barriers&lang=zh"

# Get beginner exercises for individuals
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises?difficulty=beginner&targetAudience=individual"
```

#### GET /exercises/:id

Retrieve a single exercise by ID.

**Path Parameters:**
- `id`: Exercise ID (numeric string)

**Query Parameters:**
- `lang` (optional): Language for response (`en` or `zh`)

**Example Requests:**
```bash
# Get exercise with ID 1
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  http://localhost:3000/exercises/1

# Get exercise with ID 1 in Chinese
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises/1?lang=zh"
```

#### GET /health

Health check endpoint.

**Example Request:**
```bash
curl http://localhost:3000/health
```

## Exercise Types

1. **observation-evaluation**: Distinguishing observations from evaluations
2. **feelings-thoughts**: Identifying genuine feelings vs thoughts
3. **needs-demands**: Expressing needs without making demands  
4. **listening-barriers**: Common barriers to empathetic listening
5. **requests**: Making clear, specific requests
6. **gratitude**: Expressing appreciation in NVC format
7. **conflict-resolution**: Step-by-step conflict resolution

## Response Format

### Single Exercise (with language specified)
```json
{
  "id": "1",
  "type": "listening-barriers",
  "name": "Advising",
  "description": "Giving advice or solutions without being asked",
  "difficulty": "beginner",
  "targetAudience": "individual",
  "relatedExercises": ["2", "3"],
  "example": "You should just talk to your boss about it.",
  "nvcAlternative": "It sounds like you're feeling frustrated..."
}
```

### Single Exercise (multilingual - no lang parameter)
```json
{
  "id": "1",
  "type": "listening-barriers",
  "name": {
    "en": "Advising",
    "zh": "建议"
  },
  "description": {
    "en": "Giving advice or solutions without being asked",
    "zh": "未经请求就给出建议或解决方案"
  },
  "difficulty": "beginner",
  "targetAudience": "individual",
  "relatedExercises": ["2", "3"],
  "example": {
    "en": "You should just talk to your boss about it.",
    "zh": "你应该直接和你的老板谈谈。"
  },
  "nvcAlternative": {
    "en": "It sounds like you're feeling frustrated...",
    "zh": "听起来你在工作中感到很沮丧..."
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Missing Authorization header"
}
```

```json
{
  "error": "Invalid API key"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid language. Use 'en' or 'zh'."
}
```

### 404 Not Found
```json
{
  "error": "Exercise not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Example Usage

### JavaScript/Node.js
```javascript
const API_KEY = 'nvc_your_api_key_here';
const headers = { 'Authorization': `Bearer ${API_KEY}` };

// Fetch all listening barrier exercises
const response = await fetch('http://localhost:3000/exercises?type=listening-barriers', {
  headers
});
const exercises = await response.json();

// Fetch a specific exercise in Chinese
const exercise = await fetch('http://localhost:3000/exercises/1?lang=zh', {
  headers
});
const data = await exercise.json();
```

### Python
```python
import requests

API_KEY = 'nvc_your_api_key_here'
headers = {'Authorization': f'Bearer {API_KEY}'}

# Get all exercises
response = requests.get('http://localhost:3000/exercises', headers=headers)
exercises = response.json()

# Get gratitude exercises in Chinese
response = requests.get('http://localhost:3000/exercises', 
    params={'type': 'gratitude', 'lang': 'zh'},
    headers=headers
)
gratitude_exercises = response.json()
```

### cURL Examples
```bash
# Get all observation-evaluation exercises
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises?type=observation-evaluation"

# Get intermediate difficulty exercises
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises?difficulty=intermediate"

# Get group exercises in Chinese
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises?targetAudience=group&lang=zh"

# Get a specific exercise
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  "http://localhost:3000/exercises/5"
```

## Database

The API uses SQLite for data storage. The database file (`exercises.db`) is automatically created and seeded with sample exercises on first run.

### Sample Data

The API comes with 10 sample exercises covering all exercise types:
- 3 Listening barrier exercises
- 2 Observation vs evaluation exercises  
- 1 Feelings vs thoughts exercise
- 1 Needs vs demands exercise
- 1 Requests exercise
- 1 Gratitude exercise
- 1 Conflict resolution exercise

## Development

### Project Structure
```
nvc-api/
├── src/
│   ├── index.ts        # Main API server
│   └── database.ts     # Database setup and operations
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts
```bash
# Development server with auto-reload
bun run dev

# Initialize database
bun run init-db

# API key management
bun run api-keys create "App Name"
bun run api-keys list

# Type checking
bun run tsc --noEmit
```

## Technology Stack

- **Runtime**: Bun
- **Framework**: Elysia.js
- **Database**: SQLite (bun:sqlite)
- **Language**: TypeScript
- **CORS**: @elysiajs/cors

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## API Key Management

### Creating API Keys
```bash
# Create a new API key
bun run api-keys create "Mobile App"

# List all API keys (shows metadata, not actual keys)
bun run api-keys list

# Deactivate an API key
bun run scripts/manage_api_keys.ts deactivate 1
```

### Admin Endpoints
For programmatic API key management:

- `POST /admin/api-keys` - Create new API key
- `GET /admin/api-keys` - List all API keys
- `DELETE /admin/api-keys/:id` - Deactivate API key

### Security Best Practices
- Store API keys in environment variables
- Never commit API keys to version control
- Rotate keys regularly
- Use separate keys for different applications
- Monitor usage via the `last_used` timestamp

## Support

For questions or issues, please create an issue in the project repository.

For detailed authentication documentation, see [API_AUTHENTICATION.md](./API_AUTHENTICATION.md).