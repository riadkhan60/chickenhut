require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const os = require('os'); // Added to detect operating system

const app = express();
app.use(express.json());

// Add default PostgreSQL bin directory path for Windows
const DEFAULT_PG_BIN_PATH =
  process.env.PG_BIN_PATH ||
  (os.platform() === 'win32'
    ? 'C:\\Program Files\\PostgreSQL\\17\\bin'
    : '/usr/bin');

// Default configurations with your specific database settings
const config = {
  port: process.env.PORT || 3007,
  pgDatabase: process.env.PG_DATABASE || 'chikenhut',
  pgHost: process.env.PG_HOST || 'localhost',
  pgPort: process.env.PG_PORT || 5432,
  pgUser: process.env.PG_USER || 'postgres',
  pgPassword: process.env.PG_PASSWORD || 'riad1234',
  backupPath: process.env.BACKUP_PATH || './backups',
  backupSchedule: process.env.BACKUP_SCHEDULE || '0 21 * * *', // Default: daily at 9pm
  maxBackups: process.env.MAX_BACKUPS || 1, // Default: keep 7 backups
  pgBinPath: process.env.PG_BIN_PATH || DEFAULT_PG_BIN_PATH,
};

// Create backup directory if it doesn't exist
if (!fs.existsSync(config.backupPath)) {
  fs.mkdirSync(config.backupPath, { recursive: true });
}

// Function to perform database backup
const performBackup = () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup-${config.pgDatabase}-${timestamp}.sql`;
    const backupFilePath = path.join(config.backupPath, backupFilename);

    // Construct the pg_dump command based on OS
    let cmd;
    const pgDumpPath = path.join(config.pgBinPath, 'pg_dump');

    if (os.platform() === 'win32') {
      // Windows-specific command (using SET command to set env variable)
      cmd = `set "PGPASSWORD=${config.pgPassword}" && "${pgDumpPath}" -h ${config.pgHost} -p ${config.pgPort} -U ${config.pgUser} -F p ${config.pgDatabase} > "${backupFilePath}"`;
    } else {
      // Unix-based systems
      cmd = `PGPASSWORD=${config.pgPassword} "${pgDumpPath}" -h ${config.pgHost} -p ${config.pgPort} -U ${config.pgUser} -F p ${config.pgDatabase} > "${backupFilePath}"`;
    }

    console.log(`Starting backup to ${backupFilePath}...`);

    // Use shell option for Windows to ensure environment variables are processed correctly
    exec(cmd, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup error: ${error.message}`);
        return reject(error);
      }

      if (stderr) {
        console.error(`Backup stderr: ${stderr}`);
      }

      console.log(`Backup completed successfully: ${backupFilePath}`);
      resolve(backupFilePath);

      // Clean up old backups
      cleanupOldBackups();
    });
  });
};

// Function to clean up old backups
const cleanupOldBackups = () => {
  fs.readdir(config.backupPath, (err, files) => {
    if (err) {
      console.error(`Error reading backup directory: ${err}`);
      return;
    }

    // Get only .sql backup files
    const backupFiles = files
      .filter((file) => file.startsWith('backup-') && file.endsWith('.sql'))
      .map((file) => {
        const filePath = path.join(config.backupPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          mtime: stats.mtime,
        };
      })
      // Sort by modification time (oldest first)
      .sort((a, b) => a.mtime - b.mtime);

    console.log(
      `Found ${backupFiles.length} backup files, max allowed is ${config.maxBackups}`,
    );

    // Delete old backups if we have more than maxBackups
    if (backupFiles.length > config.maxBackups) {
      const filesToDelete = backupFiles.slice(
        0,
        backupFiles.length - config.maxBackups,
      );

      console.log(`Removing ${filesToDelete.length} old backup(s)`);

      filesToDelete.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting old backup ${file.path}: ${err}`);
          } else {
            console.log(`Deleted old backup: ${file.path}`);
          }
        });
      });
    } else {
      console.log('No backups need to be removed at this time');
    }
  });
};

// Setup scheduled backup task
let scheduledTask = null;

const setupScheduledBackup = () => {
  if (scheduledTask) {
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule(config.backupSchedule, async () => {
    console.log('Running scheduled backup...');
    try {
      await performBackup();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  });

  console.log(`Scheduled backup set: ${config.backupSchedule}`);
};

// Start the scheduled task
setupScheduledBackup();

// API Routes
app.get('/', (req, res) => {
  res.send('PostgreSQL Backup Server is running');
});

// Get current configuration
app.get('/config', (req, res) => {
  // Don't send the password in the response
  const safeConfig = { ...config };
  safeConfig.pgPassword = '********';
  res.json(safeConfig);
});

// Update configuration
app.post('/config', (req, res) => {
  const updates = req.body;
  Object.keys(updates).forEach((key) => {
    if (key in config) {
      config[key] = updates[key];
    }
  });

  // If backup schedule was updated, restart the scheduled task
  if ('backupSchedule' in updates) {
    setupScheduledBackup();
  }

  // Ensure backup directory exists if it was changed
  if ('backupPath' in updates && !fs.existsSync(config.backupPath)) {
    fs.mkdirSync(config.backupPath, { recursive: true });
  }

  // Don't send the password in the response
  const safeConfig = { ...config };
  safeConfig.pgPassword = '********';
  res.json(safeConfig);
});

// Trigger an immediate backup
app.post('/backup', async (req, res) => {
  try {
    const backupPath = await performBackup();
    res.json({ success: true, backupPath });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List available backups
app.get('/backups', (req, res) => {
  fs.readdir(config.backupPath, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    const backups = files
      .filter((file) => file.startsWith('backup-') && file.endsWith('.sql'))
      .map((file) => {
        const filePath = path.join(config.backupPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Sort newest first

    res.json({ success: true, backups });
  });
});

// Delete a specific backup
app.delete('/backup/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(config.backupPath, filename);

  // Make sure the file exists and is a backup file
  if (!filename.startsWith('backup-') || !filename.endsWith('.sql')) {
    return res
      .status(400)
      .json({ success: false, error: 'Invalid backup filename' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, message: `Backup ${filename} deleted` });
  });
});

// Start the server
const server = app.listen(config.port, () => {
  console.log(`PostgreSQL Backup Server running on port ${config.port}`);
  console.log(`Backup destination: ${config.backupPath}`);
  console.log(`PostgreSQL bin path: ${config.pgBinPath}`);
  console.log(`Backup schedule: ${config.backupSchedule}`);

  // Perform immediate backup on server start
  console.log('Performing initial backup on server start...');
  performBackup()
    .then(() => console.log('Initial backup completed'))
    .catch((err) => console.error('Initial backup failed:', err));
});

// Handle errors if port is already in use
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${config.port} is already in use. Another instance may be running.`,
    );
    console.error('Please use a different port or stop the other instance.');
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});
