const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizePermission } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all users
router.get('/', authenticateToken, authorizePermission('MANAGE_USERS'), (req, res) => {
    db.all(
        `SELECT u.id, u.username, u.email, u.full_name, u.matric_number, u.staff_id, 
                r.name as role_name, u.is_active, d.name as department_name, l.name as level_name,
                u.phone, u.gender
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN levels l ON u.level_id = l.id`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Create/Provision User
router.post('/provision', authenticateToken, authorizePermission('MANAGE_USERS'), async (req, res) => {
    const { 
        username, email, password, role_id, full_name, 
        matric_number, staff_id, department_id, level_id,
        phone, gender, address 
    } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'KogiPoly2024!', salt);

        db.run(
            `INSERT INTO users (
                username, email, password_hash, role_id, full_name, 
                matric_number, staff_id, department_id, level_id,
                phone, gender, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username, email, hashedPassword, role_id, full_name, 
                matric_number, staff_id, department_id, level_id,
                phone, gender, address
            ],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                db.run(`INSERT INTO audit_logs (user_id, action, resource, details) VALUES (?, ?, ?, ?)`,
                    [req.user.id, 'PROVISIONING', 'USER_MANAGEMENT', `Provisioned user: ${username}`]);

                res.json({ id: this.lastID, message: 'User provisioned successfully' });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error during hashing' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
    db.get(
        `SELECT u.id, u.username, u.email, u.full_name, u.matric_number, u.staff_id, 
                r.name as role_name, u.is_active, d.name as department_name, l.name as level_name,
                u.phone, u.gender, u.address, u.created_at
         FROM users u 
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN levels l ON u.level_id = l.id
         WHERE u.id = ?`,
        [req.user.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Profile not found' });
            res.json(row);
        }
    );
});

module.exports = router;
