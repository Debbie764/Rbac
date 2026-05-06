const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizePermission } = require('../middleware/auth');

// Get all roles
router.get('/', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    db.all(`SELECT * FROM roles`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get all permissions
router.get('/permissions', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    db.all(`SELECT * FROM permissions`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create role
router.post('/', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    const { name, description, permissionIds } = req.body;
    db.run(`INSERT INTO roles (name, description) VALUES (?, ?)`, [name, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const roleId = this.lastID;
        
        if (permissionIds && Array.isArray(permissionIds)) {
            db.serialize(() => {
                const stmt = db.prepare(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`);
                permissionIds.forEach(pId => stmt.run(roleId, pId));
                stmt.finalize(() => {
                    res.json({ id: roleId, message: 'Role created with permissions' });
                });
            });
        } else {
            res.json({ id: roleId, message: 'Role created successfully' });
        }
    });
});

// Update role
router.put('/:id', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    const { name, description, permissionIds } = req.body;
    const roleId = req.params.id;
    
    db.serialize(() => {
        db.run(`UPDATE roles SET name = ?, description = ? WHERE id = ?`, [name, description, roleId]);
        
        if (permissionIds && Array.isArray(permissionIds)) {
            db.run(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);
            const stmt = db.prepare(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`);
            permissionIds.forEach(pId => stmt.run(roleId, pId));
            stmt.finalize(() => {
                res.json({ message: 'Role and permissions updated successfully' });
            });
        } else {
            res.json({ message: 'Role updated successfully' });
        }
    });
});

// Delete role
router.delete('/:id', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    db.run(`DELETE FROM roles WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Role deleted successfully' });
    });
});

// Assign permissions to role
router.post('/:id/permissions', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    const roleId = req.params.id;
    const { permissionIds } = req.body; // Array of permission IDs

    db.serialize(() => {
        db.run(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);
        const stmt = db.prepare(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`);
        permissionIds.forEach(pId => stmt.run(roleId, pId));
        stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: 'Failed to assign permissions' });
            res.json({ message: 'Permissions assigned successfully' });
        });
    });
});

// Get permissions for a specific role
router.get('/:id/permissions', authenticateToken, authorizePermission('MANAGE_ROLES'), (req, res) => {
    const roleId = req.params.id;
    db.all(
        `SELECT p.* FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         WHERE rp.role_id = ?`,
        [roleId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;
