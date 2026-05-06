const fs = require('fs');
const path = require('path');
const db = require('./db');

function initDb() {
    console.log('Initializing database with new schema...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

    db.serialize(() => {
        // Optional: Drop existing tables if you want a clean slate
        // WARNING: This deletes data. 
        // db.run("DROP TABLE IF EXISTS user_courses");
        // db.run("DROP TABLE IF EXISTS courses");
        // ... etc
        
        statements.forEach(stmt => {
            db.run(stmt, (err) => {
                if (err) {
                    console.error('Error executing statement:', stmt.substring(0, 50) + '...');
                    console.error(err.message);
                }
            });
        });
        
        console.log('Schema applied successfully.');
    });
}

initDb();
