# API Authentication

This document describes the API key-based authentication system for the NVC Exercises API.

## Overview

The NVC Exercises API uses API key-based authentication to secure access to exercise data. All endpoints except `/health` require a valid API key.

## Authentication Method

### API Key Format
- API keys are prefixed with `nvc_` followed by 32 random characters
- Example: `nvc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Authorization Header
Include the API key in the `Authorization` header using the Bearer token format:

```
Authorization: Bearer nvc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Alternatively, you can pass the API key directly without the `Bearer` prefix:

```
Authorization: nvc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Protected Endpoints

The following endpoints require authentication:
- `GET /exercises` - List all exercises
- `GET /exercises/:id` - Get specific exercise

## Public Endpoints

The following endpoints do not require authentication:
- `GET /health` - Health check
- `GET /` - API status

## Admin Endpoints

The following endpoints are for API key management (currently unprotected for development):
- `POST /admin/api-keys` - Create new API key
- `GET /admin/api-keys` - List all API keys
- `DELETE /admin/api-keys/:id` - Deactivate API key

## Error Responses

### 401 Unauthorized
Returned when authentication fails:

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

## API Key Management

### Creating API Keys

#### Using the Management Script
```bash
# Create a new API key
bun run api-keys create "My App"

# List all API keys
bun run api-keys list

# Deactivate an API key
bun run scripts/manage_api_keys.ts deactivate 1
```

#### Using the API Endpoint
```bash
curl -X POST http://localhost:3000/admin/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My Application"}'
```

Response:
```json
{
  "message": "API key created successfully",
  "apiKey": "nvc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "id": 1
}
```

### Listing API Keys

```bash
curl http://localhost:3000/admin/api-keys
```

Response:
```json
[
  {
    "id": 1,
    "name": "My Application",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00.000Z",
    "last_used": "2024-01-01T12:30:00.000Z"
  }
]
```

### Deactivating API Keys

```bash
curl -X DELETE http://localhost:3000/admin/api-keys/1
```

Response:
```json
{
  "message": "API key deactivated successfully"
}
```

## Usage Examples

### Fetch All Exercises
```bash
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  http://localhost:3000/exercises
```

### Fetch Specific Exercise
```bash
curl -H "Authorization: Bearer nvc_your_api_key_here" \
  http://localhost:3000/exercises/1?lang=en
```

### JavaScript/TypeScript Example
```javascript
const API_KEY = 'nvc_your_api_key_here';
const BASE_URL = 'http://localhost:3000';

async function fetchExercises() {
  const response = await fetch(`${BASE_URL}/exercises`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}
```

### Python Example
```python
import requests

API_KEY = 'nvc_your_api_key_here'
BASE_URL = 'http://localhost:3000'

headers = {
    'Authorization': f'Bearer {API_KEY}'
}

response = requests.get(f'{BASE_URL}/exercises', headers=headers)
exercises = response.json()
```

## Security Considerations

1. **Store API keys securely** - Never commit API keys to version control
2. **Use environment variables** - Store API keys in environment variables
3. **Rotate keys regularly** - Deactivate old keys and create new ones periodically
4. **Monitor usage** - Check the `last_used` timestamp to identify unused keys
5. **Principle of least privilege** - Create separate keys for different applications

## Database Schema

The API keys are stored in the `api_keys` table:

```sql
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used DATETIME
);
```

## Implementation Details

- API keys are hashed using SHA-256 before storage
- Keys are validated on each request and `last_used` is updated
- Deactivated keys are not deleted but marked as `is_active = 0`
- The system automatically creates the `api_keys` table on first run