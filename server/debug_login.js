const bcrypt = require('bcryptjs');
const db = require('./db');

async function testLoginMatch() {
    const password = 'password123';
    db.get('SELECT * FROM users WHERE username = ?', ['admin_musa'], async (err, user) => {
        if (err) {
            console.error('DB Error:', err.message);
            process.exit(1);
        }
        if (!user) {
            console.error('User admin_musa not found in DB');
            process.exit(1);
        }
        console.log('User found in DB');
        console.log('Username:', user.username);
        console.log('Stored Hash:', user.password_hash);
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Bcrypt Comparison Result:', isMatch);
        
        process.exit(0);
    });
}

testLoginMatch();
