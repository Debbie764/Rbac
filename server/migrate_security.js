const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'iam.db');
const db = new sqlite3.Database(dbPath);

const migrations = [
    `ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN locked_until DATETIME`,
    `ALTER TABLE users ADD COLUMN last_login_ip TEXT`,
    `CREATE TABLE IF NOT EXISTS security_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT,
        user_id INTEGER,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_resolved INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`
];

db.serialize(() => {
    migrations.forEach(sql => {
        db.run(sql, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Skipping: Column already exists.`);
                } else {
                    console.error(`Migration error (${sql}):`, err.message);
                }
            } else {
                console.log(`Migration successful: ${sql.substring(0, 30)}...`);
            }
        });
    });
});

db.close();
