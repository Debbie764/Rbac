const db = require('./db');

function migrate() {
    console.log('Starting migration to add missing columns...');
    
    const columns = [
        { name: 'failed_attempts', type: 'INTEGER DEFAULT 0' },
        { name: 'locked_until', type: 'DATETIME' },
        { name: 'last_login_ip', type: 'TEXT' }
    ];

    db.serialize(() => {
        columns.forEach(col => {
            db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err) => {
                if (err) {
                    if (err.message.includes('duplicate column name')) {
                        console.log(`Column '${col.name}' already exists.`);
                    } else {
                        console.error(`Error adding column '${col.name}':`, err.message);
                    }
                } else {
                    console.log(`Column '${col.name}' added successfully.`);
                }
            });
        });
        
        console.log('Migration completed.');
    });
}

migrate();
