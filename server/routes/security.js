const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizePermission } = require('../middleware/auth');

// Get all security alerts
router.get('/alerts', authenticateToken, authorizePermission('VIEW_AUDIT_LOGS'), (req, res) => {
    db.all(
        `SELECT a.*, u.username 
         FROM security_alerts a 
         LEFT JOIN users u ON a.user_id = u.id 
         ORDER BY a.timestamp DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Resolve an alert
router.patch('/alerts/:id/resolve', authenticateToken, authorizePermission('VIEW_AUDIT_LOGS'), (req, res) => {
    const alertId = req.params.id;
    db.run(`UPDATE security_alerts SET is_resolved = 1 WHERE id = ?`, [alertId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Alert resolved successfully' });
    });
});

// Manually unlock a user
router.post('/users/:id/unlock', authenticateToken, authorizePermission('MANAGE_USERS'), (req, res) => {
    const userId = req.params.id;
    db.run(
        `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?`,
        [userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.run(`INSERT INTO audit_logs (user_id, action, resource, details) 
                    VALUES (?, 'SECURITY_ACTION', 'USER_MANAGEMENT', 'Manually unlocked user account')`,
                [req.user.id]);
                
            res.json({ message: 'User account unlocked successfully' });
        }
    );
});

// Get global system stats for 'Security Pulse'
router.get('/stats', authenticateToken, authorizePermission('VIEW_AUDIT_LOGS'), (req, res) => {
    const stats = {};
    db.get(`SELECT COUNT(*) as count FROM security_alerts WHERE is_resolved = 0`, (err, row) => {
        stats.activeAlerts = row ? row.count : 0;
        db.get(`SELECT COUNT(*) as count FROM users WHERE locked_until > DATETIME('now')`, (err, row) => {
            stats.lockedUsers = row ? row.count : 0;
            db.get(`SELECT COUNT(*) as count FROM audit_logs WHERE timestamp > DATETIME('now', '-24 hours')`, (err, row) => {
                stats.totalActions24h = row ? row.count : 0;
                res.json(stats);
            });
        });
    });
});

module.exports = router;
