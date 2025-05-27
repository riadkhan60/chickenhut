# ChikenHut Restaurant Management System

A comprehensive restaurant management application built with Next.js, featuring order management, automated reporting, and database backup functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [PostgreSQL Installation & Setup](#postgresql-installation--setup)
- [Project Installation](#project-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Services Overview](#services-overview)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

ChikenHut is a full-stack restaurant management system that provides:

- Order management and tracking
- Menu item management
- Table management
- Automated daily reporting via email
- Database backup functionality
- User authentication and authorization

## ✨ Features

### Core Features

- **Order Management**: Create, track, and complete orders
- **Menu Management**: Add, edit, and manage menu items
- **Table Management**: Organize restaurant tables and assignments
- **Real-time Updates**: Live order status updates
- **User Authentication**: Secure login system with NextAuth.js

### Automation Features

- **Automated Reports**: Daily email reports of completed orders
- **Database Backups**: Scheduled PostgreSQL database backups
- **Configurable Timing**: Customizable report sending times

### Dashboard Features

- **Analytics**: Order statistics and revenue tracking
- **Billing History**: Complete transaction records
- **Statement Generation**: Detailed financial statements

## 🔧 System Requirements

- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 12 or higher
- **npm**: Version 8.0 or higher
- **Operating System**: Windows 10/11, macOS, or Linux

## 🗄️ PostgreSQL Installation & Setup

### Windows Installation

1. **Download PostgreSQL**

   - Visit [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)
   - Download the latest version (recommended: PostgreSQL 15 or 17)

2. **Install PostgreSQL**

   - Run the installer as Administrator
   - Follow the installation wizard
   - **Important**: Remember the password you set for the `postgres` user
   - Default port: `5432` (keep this unless you have conflicts)
   - Install pgAdmin 4 when prompted (recommended)

3. **Verify Installation**

   ```bash
   # Open Command Prompt and test
   psql --version
   ```

4. **Add PostgreSQL to PATH** (if not automatically added)
   - Add `C:\Program Files\PostgreSQL\17\bin` to your system PATH
   - Restart your command prompt

### macOS Installation

1. **Using Homebrew** (Recommended)

   ```bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

   # Install PostgreSQL
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Using PostgreSQL.app**
   - Download from [Postgres.app](https://postgresapp.com/)
   - Drag to Applications folder and launch

### Linux Installation (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Setting up pgAdmin

1. **Launch pgAdmin**

   - Windows: Start Menu → pgAdmin 4
   - macOS: Applications → pgAdmin 4
   - Linux: `sudo apt install pgadmin4` then launch

2. **Connect to PostgreSQL**

   - Open pgAdmin
   - Right-click "Servers" → Create → Server
   - **General Tab**: Name: `Local PostgreSQL`
   - **Connection Tab**:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: [your postgres password]

3. **Create Database**
   - Right-click on your server → Create → Database
   - Database name: `chikenhut`
   - Owner: `postgres`
   - Click Save

## 🚀 Project Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd chikenhutapp
```

### 2. Install Dependencies

```bash
# Install main application dependencies
npm install

# Install backup service dependencies
cd dbbackup
npm install express dotenv child_process fs path node-cron

# Install report service dependencies
cd ../sendReport
npm install express pg pdfkit fs path moment moment-timezone nodemailer node-cron
```

### 3. Install Additional Global Tools

```bash
# Install Prisma CLI globally (optional but recommended)
npm install -g prisma
```

## ⚙️ Environment Configuration

### 1. Main Application Environment

Create `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:riad1234@localhost:5432/chikenhut?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application Settings
NODE_ENV="development"
```

### 2. Database Backup Service Environment

Create `dbbackup/.env` file:

```env
# Server Configuration
PORT=3007

# PostgreSQL Configuration
PG_DATABASE=chikenhut
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=riad1234

# Backup Configuration
BACKUP_PATH=./backups
BACKUP_SCHEDULE=0 21 * * *
MAX_BACKUPS=7

# PostgreSQL Binary Path (adjust based on your installation)
# Windows
PG_BIN_PATH=C:\Program Files\PostgreSQL\17\bin
# macOS (Homebrew)
# PG_BIN_PATH=/opt/homebrew/bin
# Linux
# PG_BIN_PATH=/usr/bin
```

### 3. Report Service Environment

The report service uses the same database connection. Update the connection string in `sendReport/index.js` if needed:

```javascript
const config = {
  database: {
    connectionString:
      'postgresql://postgres:riad1234@localhost:5432/chikenhut?schema=public',
  },
  email: {
    from: 'your-email@zohomail.com',
    to: 'recipient@gmail.com',
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'your-email@zohomail.com',
      pass: 'your-app-password',
    },
  },
};
```

## 🗃️ Database Setup

### 1. Generate Prisma Client

```bash
npm run prisma:generate
```

### 2. Run Database Migrations

```bash
npm run prisma:migrate
```

### 3. Verify Database Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your database.

### 4. Seed Initial Data (Optional)

You can manually add initial data through Prisma Studio or pgAdmin:

**Sample Menu Items:**

- Chicken Burger - Item #101 - $12.99
- French Fries - Item #201 - $4.99
- Coca Cola - Item #301 - $2.99

**Sample Tables:**

- Table 1, Table 2, Table 3, etc.

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the main application:**

   ```bash
   npm run dev
   ```

   Access at: `http://localhost:3000`

2. **Start the backup service:**

   ```bash
   cd dbbackup
   node index.js
   ```

   Service runs on: `http://localhost:3007`

3. **Start the report service:**
   ```bash
   cd sendReport
   node index.js
   ```
   Service runs on: `http://localhost:3006`

### Production Mode

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## 🔧 Services Overview

### Main Application (Port 3000)

- **Framework**: Next.js 15.3.2
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS with Radix UI components

### Database Backup Service (Port 3007)

- **Purpose**: Automated PostgreSQL database backups
- **Schedule**: Daily at 9 PM (configurable)
- **Features**:
  - Automatic backup creation
  - Old backup cleanup
  - Manual backup triggers
  - Backup file management

### Report Service (Port 3006)

- **Purpose**: Automated daily order reports
- **Features**:
  - PDF report generation
  - Email delivery via Zoho Mail
  - Configurable sending times
  - Order tracking and marking

## 📡 API Endpoints

### Main Application

- `GET /api/menu-item` - Get all menu items
- `POST /api/menu-item` - Create new menu item
- `GET /api/order` - Get all orders
- `POST /api/order` - Create new order
- `GET /api/table` - Get all tables
- `POST /api/table` - Create new table

### Backup Service

- `GET /` - Service status
- `GET /config` - Get current configuration
- `POST /config` - Update configuration
- `POST /backup` - Trigger immediate backup
- `GET /backups` - List all backups
- `DELETE /backup/:filename` - Delete specific backup

### Report Service

- `GET /generate-report` - Generate and send report
- `GET /run-report` - Direct execution endpoint
- `GET /test-pdf` - Generate test PDF

## 🚀 Deployment

### Railway Deployment

1. **Prepare for deployment:**

   ```bash
   # Ensure all environment variables are set
   # Update database connection strings for production
   ```

2. **Railway configuration** (railway.json):
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "numReplicas": 1,
       "sleepApplication": false
     }
   }
   ```

### Environment Variables for Production

Set these in your deployment platform:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**

   ```bash
   # Check if PostgreSQL is running
   # Windows
   services.msc → PostgreSQL service

   # macOS
   brew services list | grep postgresql

   # Linux
   sudo systemctl status postgresql
   ```

2. **Port Already in Use**

   ```bash
   # Find process using port
   netstat -ano | findstr :3000

   # Kill process (Windows)
   taskkill /PID <process-id> /F
   ```

3. **Prisma Migration Issues**

   ```bash
   # Reset database (WARNING: This will delete all data)
   npx prisma migrate reset

   # Generate client
   npx prisma generate
   ```

4. **Email Not Sending**
   - Verify Zoho Mail credentials
   - Check if 2FA is enabled (use app password)
   - Verify SMTP settings

### Database Issues

1. **Cannot connect to database**

   - Verify PostgreSQL is running
   - Check connection string in `.env`
   - Ensure database `chikenhut` exists

2. **Migration errors**

   ```bash
   # Check migration status
   npx prisma migrate status

   # Apply pending migrations
   npx prisma migrate deploy
   ```

### Service Issues

1. **Backup service fails**

   - Check PostgreSQL bin path in environment
   - Verify database credentials
   - Ensure backup directory exists and is writable

2. **Report service fails**
   - Check database connection
   - Verify email configuration
   - Check if orders exist to report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: Remember to keep your environment variables secure and never commit sensitive information like passwords or API keys to version control.
