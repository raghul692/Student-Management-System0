# Deployment & Maintenance Guide

## 🚀 Online Deployment Options

### Option 1: Railway (Recommended - Easiest)

1. **Create account** at https://railway.app
2. **Connect GitHub** repository
3. **Create new project** → "Deploy from GitHub repo"
4. **Add MySQL database** → "Provision MySQL"
5. **Set environment variables:**
   ```
   DB_HOST=containers-us-west.railway.app
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=railway
   PORT=3000
   ```
6. **Deploy** - Railway automatically builds and deploys

**Cost:** Free tier available, ~$5/month for production

---

### Option 2: Render.com

1. **Create account** at https://render.com
2. **Create Web Service** → Connect GitHub repo
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. **Add PostgreSQL/MySQL** database
6. **Set environment variables** in Settings tab
7. **Deploy**

**Cost:** Free tier available, ~$20/month for production

---

### Option 3: DigitalOcean App Platform

1. **Create account** at https://digitalocean.com
2. **Create App** → Connect GitHub
3. **Configure** Node.js service
4. **Add Database** (Managed MySQL)
5. **Set environment variables**
6. **Deploy**

**Cost:** ~$5-20/month

---

### Option 4: Heroku (Legacy)

```bash
# Install Heroku CLI
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
heroku login
heroku create
heroku addons:create jawsdb:kitefin
git push heroku main
```

**Note:** Heroku free tier discontinued in Nov 2022

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (.env)

```env
# Production Settings
NODE_ENV=production
PORT=3000

# Database (Use managed service URL)
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=sms_db

# Session Secret (Generate random string)
SESSION_SECRET=your-super-secret-random-string-min-32-chars
```

### 2. Generate Secure Session Secret

```bash
# Run this command
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup (Production)

**Option A: Use Provider's Managed Database**
- Railway, Render, DigitalOcean all offer managed MySQL
- Use connection string provided

**Option B: Remote MySQL Server**
```sql
-- Create database
CREATE DATABASE sms_db;

-- Create user
CREATE USER 'sms_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON sms_db.* TO 'sms_user'@'%';
FLUSH PRIVILEGES;
```

---

## 🔧 Maintenance Tasks

### Daily Tasks
1. **Monitor logs** for errors
2. **Check database connections** are healthy
3. **Verify backup completion**

### Weekly Tasks
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Review logs
tail -n 100 logs/app.log
```

### Monthly Tasks
1. **Security updates**
   ```bash
   npm audit fix
   ```
2. **Performance review**
   - Check response times
   - Review slow queries
3. **Database maintenance**
   ```sql
   -- Optimize tables
   OPTIMIZE TABLE users, students, marks;
   ```

---

## 💾 Backup Strategy

### Automated Backups (Recommended)

**Railway/Render:** Automatic daily backups included

**Manual Backups:**
```bash
# Export database
mysqldump -h [HOST] -u [USER] -p [DB_NAME] > backup_$(date +%Y%m%d).sql

# Upload to cloud storage (AWS S3, Google Drive, etc.)
```

### Backup Script (backup.sh)
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/sms_$DATE.sql
# Upload to cloud
aws s3 cp $BACKUP_DIR/sms_$DATE.sql s3://your-bucket/backups/
```

Add cron job:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 📊 Monitoring

### Application Monitoring

**Option 1: PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start server.js --name "sms-app"

# Monitor
pm2 monit

# View logs
pm2 logs

# Setup auto-restart
pm2 startup
pm2 save
```

**Option 2: Health Check Endpoint**

Add to `app.js`:
```javascript
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
```

### Error Tracking

**Use services like:**
- Sentry.io (Free tier available)
- LogRocket
- Rollbar

---

## 🔒 Security Best Practices

### 1. HTTPS/SSL
- Most hosting providers (Railway, Render) provide automatic SSL
- Verify your domain has valid certificate

### 2. Environment Variables
```env
# Never commit .env to git
# Add to .gitignore
echo ".env" >> .gitignore
```

### 3. Database Security
- Use strong passwords
- Restrict database user permissions
- Enable firewall rules
- Use SSL for database connections

### 4. Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update safely
npm update
npm audit
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Solution: Check DATABASE_URL environment variable
Verify database is running and accessible
```

**2. Port Not Listening**
```
Solution: Ensure PORT env var is set
Check if port 3000 is available
```

**3. Session Issues**
```
Solution: Clear browser cookies
Check SESSION_SECRET is set
Ensure cookie.secure = true in production
```

**4. Static Files Not Loading**
```
Solution: Check express.static middleware
Verify public directory exists
```

---

## 📈 Scaling

### Vertical Scaling (More Resources)
- Upgrade server plan (CPU/RAM)
- Increase database connections

### Horizontal Scaling (Multiple Instances)
```javascript
// Use Redis for session storage
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis').createClient();

app.use(session({
    store: new RedisStore({ client: redis }),
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false
}));
```

---

## 📞 Support & Resources

- **Node.js Docs:** https://nodejs.org/docs
- **Express Docs:** https://expressjs.com
- **MySQL Docs:** https://dev.mysql.com
- **Deployment Guides:**
  - Railway: https://docs.railway.app
  - Render: https://render.com/docs
