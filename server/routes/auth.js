const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// Register User (Initial Setup or Registrar only)
router.post('/register', async (req, res) => {
    const { username, email, password, role_id, full_name, matric_number, staff_id } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
            `INSERT INTO users (username, email, password_hash, role_id, full_name, matric_number, staff_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, role_id, full_name, matric_number, staff_id],
            function(err) {
                if (err) {
                    console.error('Registration DB Error:', err.message);
                    return res.status(400).json({ error: err.message });
                }
                res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
            }
        );
    } catch (error) {
        console.error('Registration Catch Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login User
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    db.get(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.username = ?`,
        [username],
        async (err, user) => {
            if (err) {
                console.error('Login DB Error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            if (!user) {
                console.log(`Login failed: User '${username}' not found`);
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if account is locked
            if (user.locked_until && new Date(user.locked_until) > new Date()) {
                const waitTime = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
                return res.status(403).json({ 
                    error: `Account locked due to multiple failed attempts. Try again in ${waitTime} minutes.` 
                });
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!validPassword) {
                const newAttempts = (user.failed_attempts || 0) + 1;
                let lockoutQuery = 'UPDATE users SET failed_attempts = ? WHERE id = ?';
                let params = [newAttempts, user.id];

                if (newAttempts >= 5) {
                    const lockTime = new Date(Date.now() + 15 * 60000).toISOString();
                    lockoutQuery = 'UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?';
                    params = [newAttempts, lockTime, user.id];
                    
                    // Trigger Security Alert
                    db.run(`INSERT INTO security_alerts (type, severity, details, user_id, ip_address) 
                            VALUES (?, ?, ?, ?, ?)`,
                        ['BRUTE_FORCE', 'HIGH', `Account '${username}' locked after 5 failed attempts`, user.id, ip]);
                }

                db.run(lockoutQuery, params);
                return res.status(401).json({ error: 'Invalid password', remainingAttempts: 5 - newAttempts });
            }

            // Success: Reset failed attempts
            db.run(`UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_ip = ? WHERE id = ?`, [ip, user.id]);

            // Fetch user permissions
            db.all(
                `SELECT p.name FROM permissions p 
                 JOIN role_permissions rp ON p.id = rp.permission_id 
                 WHERE rp.role_id = ?`,
                [user.role_id],
                (pErr, pRows) => {
                    const permissions = pRows ? pRows.map(p => p.name) : [];
                    
                    const token = jwt.sign(
                        { id: user.id, role: user.role_name, permissions },
                        JWT_SECRET,
                        { expiresIn: '8h' }
                    );

                    // Log the login attempt
                    db.run(`INSERT INTO audit_logs (user_id, action, resource, details, ip_address) VALUES (?, ?, ?, ?, ?)`,
                        [user.id, 'LOGIN', 'AUTHENTICATION', 'User logged in successfully', ip]);

                    res.json({
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            role: user.role_name,
                            full_name: user.full_name,
                            permissions
                        }
                    });
                }
            );
        }
    );
});

module.exports = router;
