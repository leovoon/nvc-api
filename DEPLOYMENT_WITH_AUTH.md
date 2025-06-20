# Deployment Guide with Authentication

This guide covers deploying the NVC Exercises API with API key authentication enabled.

## Overview

The NVC Exercises API now includes secure API key-based authentication. This guide will help you deploy the API with proper security measures in place.

## Prerequisites

- Bun runtime installed
- SQLite database support
- Production environment (Railway, Heroku, VPS, etc.)
- SSL/TLS certificate (recommended for production)

## Pre-Deployment Setup

### 1. Initialize Database

```bash
# Initialize the database with tables
bun run init-db

# Verify database structure
bun run test:db
```

### 2. Create Initial API Keys

```bash
# Create API keys for your applications
bun run api-keys create "Production Web App"
bun run api-keys create "Mobile App"
bun run api-keys create "Admin Dashboard"

# List all created keys
bun run api-keys list
```

**Important**: Save the generated API keys securely. They cannot be retrieved later.

### 3. Environment Variables

Create a `.env` file for production:

```bash
# Database
DATABASE_PATH=/app/data/exercises.db

# Server
PORT=3000
NODE_ENV=production

# API Keys (optional - for pre-configured keys)
ADMIN_API_KEY=nvc_your_admin_key_here
```

## Deployment Options

### Option 1: Railway Deployment

1. **Prepare Railway Configuration**

Create or update `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[deploy.environmentVariables]]
name = "DATABASE_PATH"
value = "/app/data/exercises.db"

[[deploy.environmentVariables]]
name = "NODE_ENV"
value = "production"
```

2. **Deploy to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

3. **Post-Deployment Setup**

```bash
# Connect to your Railway deployment
railway shell

# Create API keys on production
bun run api-keys create "Production Client"
```

### Option 2: Docker Deployment

1. **Create Dockerfile**

```dockerfile
FROM oven/bun:1.2.4-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Initialize database
RUN bun run init-db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
```

2. **Build and Run**

```bash
# Build Docker image
docker build -t nvc-api .

# Run container
docker run -d \
  --name nvc-api \
  -p 3000:3000 \
  -v nvc-data:/app/data \
  -e NODE_ENV=production \
  nvc-api
```

3. **Create API Keys**

```bash
# Execute commands in running container
docker exec -it nvc-api bun run api-keys create "Docker Client"
```

### Option 3: VPS Deployment

1. **Server Setup**

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone repository
git clone <your-repo-url>
cd nvc-api

# Install dependencies
bun install

# Initialize database
bun run init-db
```

2. **Process Management with PM2**

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nvc-api',
    script: 'bun',
    args: 'run start',
    cwd: '/path/to/nvc-api',
    env: {
      NODE_ENV: 'production',
      DATABASE_PATH: '/path/to/nvc-api/data/exercises.db'
    },
    error_file: '/var/log/nvc-api/error.log',
    out_file: '/var/log/nvc-api/out.log',
    log_file: '/var/log/nvc-api/combined.log'
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

3. **Nginx Reverse Proxy**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting (optional)
    location /exercises {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        # ... other proxy settings
    }
}
```

## Post-Deployment Configuration

### 1. Create Production API Keys

```bash
# Create keys for different clients
bun run api-keys create "Web Frontend"
bun run api-keys create "Mobile App iOS"
bun run api-keys create "Mobile App Android"
bun run api-keys create "Third Party Integration"
```

### 2. Test Deployment

```bash
# Test health endpoint (public)
curl https://your-domain.com/health

# Test authenticated endpoint
curl -H "Authorization: Bearer nvc_your_key_here" \
  https://your-domain.com/exercises

# Test admin endpoints
curl -X POST https://your-domain.com/admin/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "New Client"}'
```

### 3. Monitor API Usage

```bash
# Check API key usage
bun run api-keys list

# View last used timestamps
# Keys with recent last_used timestamps are active
```

## Security Considerations

### 1. API Key Management

- **Store keys securely**: Use environment variables or secure key management systems
- **Rotate keys regularly**: Create new keys and deactivate old ones
- **Monitor usage**: Check `last_used` timestamps to identify unused keys
- **Principle of least privilege**: Create separate keys for different applications

### 2. Network Security

- **Use HTTPS**: Always use SSL/TLS in production
- **Firewall**: Restrict access to necessary ports only
- **Rate limiting**: Implement rate limiting at the reverse proxy level
- **CORS**: Configure CORS appropriately for your frontend domains

### 3. Admin Endpoint Security

**Important**: The admin endpoints (`/admin/api-keys/*`) are currently unprotected and should be secured before production use.

Options for securing admin endpoints:
1. **IP Whitelisting**: Restrict access to specific IP addresses
2. **Additional Authentication**: Add admin-specific authentication
3. **Internal Network**: Only expose admin endpoints on internal network
4. **Remove from Production**: Disable admin endpoints and use CLI tools only

Example Nginx configuration for IP whitelisting:

```nginx
location /admin/ {
    allow 192.168.1.0/24;  # Your office network
    allow 10.0.0.0/8;      # Internal network
    deny all;
    
    proxy_pass http://localhost:3000;
    # ... other proxy settings
}
```

## Environment-Specific Configuration

### Development
```bash
# Use local database
DATABASE_PATH=./data/exercises.db
NODE_ENV=development
PORT=3000
```

### Staging
```bash
# Use staging database
DATABASE_PATH=/app/staging/exercises.db
NODE_ENV=staging
PORT=3000
```

### Production
```bash
# Use production database with backup
DATABASE_PATH=/app/data/exercises.db
NODE_ENV=production
PORT=3000
```

## Backup and Recovery

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/app/backups"
DB_PATH="/app/data/exercises.db"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/exercises_$DATE.db

# Keep only last 30 backups
find $BACKUP_DIR -name "exercises_*.db" -mtime +30 -delete
EOF

chmod +x backup.sh
```

### Automated Backups with Cron

```bash
# Add to crontab
crontab -e

# Backup daily at 2 AM
0 2 * * * /app/backup.sh
```

## Monitoring and Logging

### 1. Health Monitoring

```bash
# Simple health check script
cat > health_check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="https://your-domain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "API is healthy"
else
    echo "API health check failed: $RESPONSE"
    # Send alert (email, Slack, etc.)
fi
EOF
```

### 2. Log Management

```javascript
// Add to your application for structured logging
const logRequest = (req, res, next) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    apiKey: req.headers.authorization ? 'present' : 'missing'
  }));
  next();
};
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database file permissions
   ls -la /app/data/exercises.db
   
   # Ensure directory exists
   mkdir -p /app/data
   ```

2. **API Key Authentication Failures**
   ```bash
   # Verify API key format
   bun run api-keys list
   
   # Test authentication
   bun run test:auth
   ```

3. **Server Not Starting**
   ```bash
   # Check port availability
   netstat -tulpn | grep :3000
   
   # Check environment variables
   env | grep NODE_ENV
   ```

### Debug Commands

```bash
# Test database connection
bun run test:db

# Validate authentication
bun run test:auth

# Test all endpoints
bun run validate:endpoints

# View comprehensive demo
bun run demo:auth
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
```

### 2. Caching Strategy

Consider implementing caching for:
- Exercise data (rarely changes)
- API key validation (with TTL)
- Frequently accessed exercises

### 3. Connection Pooling

For high-traffic deployments, consider:
- Database connection pooling
- Load balancing across multiple instances
- CDN for static content

## Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] API keys properly generated and stored
- [ ] Admin endpoints secured or disabled
- [ ] Database file permissions set correctly
- [ ] Firewall configured
- [ ] Rate limiting implemented
- [ ] CORS configured appropriately
- [ ] Logging and monitoring in place
- [ ] Backup strategy implemented
- [ ] Environment variables secured

## Support and Maintenance

### Regular Tasks

1. **Weekly**: Review API key usage and deactivate unused keys
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and rotate API keys
4. **Annually**: Security audit and penetration testing

### Getting Help

- Check the troubleshooting section
- Review application logs
- Test with provided validation scripts
- Consult the API documentation

## Conclusion

This deployment guide provides a comprehensive approach to deploying the NVC Exercises API with authentication. Choose the deployment method that best fits your infrastructure and security requirements.

Remember to:
- Test thoroughly before production deployment
- Implement proper monitoring and alerting
- Keep API keys secure and rotate them regularly
- Follow security best practices for your chosen platform

For additional help, refer to the other documentation files:
- `API_AUTHENTICATION.md` - Detailed authentication documentation
- `README.md` - Basic usage and development guide
- `AUTH_IMPLEMENTATION.md` - Technical implementation details