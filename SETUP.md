# Setup Guide - API Cost Monitor

## Step-by-Step Setup Instructions

### Prerequisites Check
- ✅ Node.js installed (version 18+)
- ✅ Dependencies installed (`npm install` completed)
- ⏳ Docker Desktop installed and running

---

## Once Docker Desktop is Installed and Running

### 1. Start the Database and Redis
```bash
cd /c/Users/Laptop/Documents/New/api-cost-monitor
docker compose up -d
```

This command starts:
- PostgreSQL database on port 5432
- Redis cache on port 6379

**Wait 10-15 seconds** for PostgreSQL to fully start up.

### 2. Verify Connections
```bash
npm run db:check --workspace=backend
```

You should see:
```
✅ PostgreSQL connection successful!
✅ Redis connection successful!
🎉 All connections are working!
```

If you get errors, make sure Docker Desktop is running (check the system tray icon).

### 3. Create Database Tables
```bash
npm run db:migrate --workspace=backend
```

This creates all the tables:
- users, api_keys, api_calls
- alerts, alert_notifications
- usage_stats, rate_limits

### 4. Add Test Data
```bash
npm run db:seed --workspace=backend
```

This creates:
- A demo user account
- Sample API call history (210 calls over 7 days)
- Test alerts and rate limits

**Demo credentials:**
- Email: `demo@apicostmonitor.com`
- Password: `password123`

### 5. Start the Application
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3000
- Frontend dashboard on http://localhost:5173

### 6. Open the Dashboard
Open your browser and go to:
- http://localhost:5173

Login with the demo credentials!

---

## Quick Commands Reference

```bash
# Start Docker services
docker compose up -d

# Stop Docker services
docker compose down

# Check database connection
npm run db:check --workspace=backend

# Run migrations
npm run db:migrate --workspace=backend

# Seed test data
npm run db:seed --workspace=backend

# Start development servers
npm run dev

# View Docker logs
docker compose logs -f

# View backend logs only
npm run dev:backend

# View frontend logs only
npm run dev:frontend
```

---

## Troubleshooting

### Docker won't start
- Make sure Docker Desktop is running (system tray icon)
- Check if virtualization is enabled in BIOS
- Restart Docker Desktop

### Database connection fails
- Wait longer (PostgreSQL takes 10-15 seconds to start)
- Check logs: `docker compose logs postgres`
- Restart containers: `docker compose restart`

### Port already in use
- Backend (3000): Stop any other apps using port 3000
- Frontend (5173): Stop any other Vite apps
- PostgreSQL (5432): Stop any local PostgreSQL installations
- Redis (6379): Stop any local Redis installations

### Migration fails
- Make sure database is running: `docker compose ps`
- Check connection: `npm run db:check --workspace=backend`
- Drop and recreate: `docker compose down -v` then `docker compose up -d`

---

## What's Next?

Once everything is running, you'll have:
- ✅ A working authentication system
- ✅ Dashboard with sample data
- ✅ Database with 7 days of mock API call history
- ⏳ Need to build: Authentication endpoints, API proxy, real-time updates

Continue to the next phase where we'll:
1. Build authentication API endpoints
2. Create the API proxy that tracks costs
3. Add real-time WebSocket updates
4. Implement alert checking logic
