const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all audit logs (Admin only)
router.get('/', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
    db.all(
        `SELECT l.*, u.username 
         FROM audit_logs l 
         LEFT JOIN users u ON l.user_id = u.id 
         ORDER BY l.timestamp DESC 
         LIMIT 100`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;
