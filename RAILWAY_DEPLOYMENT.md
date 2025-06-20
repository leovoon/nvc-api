# Railway Deployment Guide

This guide explains how to deploy the NVC API to Railway with persistent database storage.

## Overview

Railway's file system is ephemeral, meaning files created during runtime are lost when the service restarts. To persist the SQLite database, we need to use Railway's persistent volume feature.

## Setup Instructions

### 1. Create a Railway Project

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository

### 2. Configure Persistent Volume

#### Option A: Using Railway Dashboard
1. Go to your service settings
2. Navigate to the "Volumes" tab
3. Click "Add Volume"
4. Set mount path to `/app/data`
5. Choose a size (1GB is sufficient for most use cases)

#### Option B: Using Railway CLI
```bash
railway volume create --name nvc-data --mount-path /app/data --size 1
```

### 3. Environment Variables

Set the following environment variables in Railway:

```
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/exercises.db
```

### 4. Deploy Configuration

The project includes a `railway.toml` file with the following configuration:

```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production.variables]
NODE_ENV = "production"
PORT = "3000"
DATABASE_PATH = "/app/data/exercises.db"
```

## Database Initialization

The application automatically initializes the database on startup:

1. **Startup Process**: The `start` script runs `scripts/start.ts`
2. **Database Init**: This calls `scripts/init_database.ts` to set up the database
3. **Seed Data**: If the database is empty, it loads data from `seed.sql`
4. **Server Start**: Finally starts the main application

### Manual Database Operations

#### Initialize Database
```bash
bun run init-db
```

#### Import from Clipboard (Development)
```bash
bun run data
```

## File Structure

```
nvc-api/
├── scripts/
│   ├── init_database.ts    # Database initialization
│   ├── start.ts           # Application startup
│   └── import_from_clipboard.ts
├── src/
│   ├── database.ts        # Database class (updated for persistent storage)
│   └── index.ts          # Main application
├── seed.sql              # Database seed data
├── railway.toml          # Railway configuration
└── package.json          # Updated with new scripts
```

## Database Path Configuration

The database path is configurable through the `DATABASE_PATH` environment variable:

- **Production (Railway)**: `/app/data/exercises.db` (persistent volume)
- **Development**: Falls back to local file system
- **Custom**: Set `DATABASE_PATH` environment variable

## Troubleshooting

### Database Not Persisting
- Ensure the volume is properly mounted at `/app/data`
- Check that `DATABASE_PATH` environment variable is set correctly
- Verify volume permissions allow write access

### Startup Failures
- Check Railway logs for database initialization errors
- Ensure `seed.sql` file is included in the deployment
- Verify all required dependencies are installed

### Health Check Issues
- The app includes a `/health` endpoint for Railway's health checks
- Increase `healthcheckTimeout` if database initialization takes longer

## Benefits of This Setup

1. **Data Persistence**: Database survives service restarts and redeployments
2. **Automatic Setup**: Database initializes automatically on first run
3. **Flexible Configuration**: Easy to switch between development and production
4. **Scalable**: Volume can be resized as data grows
5. **Backup Ready**: Volume data can be backed up through Railway

## Development vs Production

### Development
```bash
# Uses local database file
bun run dev
```

### Production (Railway)
```bash
# Uses persistent volume at /app/data/exercises.db
bun run start
```

## Volume Management

### Backup Volume Data
Railway provides automatic backups, but you can also:
1. Connect to the service via Railway CLI
2. Export database: `sqlite3 /app/data/exercises.db .dump > backup.sql`

### Restore Volume Data
1. Upload your backup SQL file
2. Run: `sqlite3 /app/data/exercises.db < backup.sql`

## Security Considerations

- Database is stored in persistent volume (not accessible externally)
- No hardcoded API keys or sensitive data
- Environment variables used for configuration
- Health check endpoint doesn't expose sensitive information