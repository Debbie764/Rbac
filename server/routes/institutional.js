const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizePermission } = require('../middleware/auth');

// --- Departments ---
router.get('/departments', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM departments`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/departments', authenticateToken, authorizePermission('MANAGE_ACADEMIC'), (req, res) => {
    const { name, description, code } = req.body;
    db.run(`INSERT INTO departments (name, description, code) VALUES (?, ?, ?)`, [name, description, code], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Department created successfully' });
    });
});

router.put('/departments/:id', authenticateToken, authorizePermission('MANAGE_ACADEMIC'), (req, res) => {
    const { name, description, code } = req.body;
    db.run(`UPDATE departments SET name = ?, description = ?, code = ? WHERE id = ?`, 
        [name, description, code, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Department updated successfully' });
    });
});

router.delete('/departments/:id', authenticateToken, authorizePermission('MANAGE_ACADEMIC'), (req, res) => {
    db.run(`DELETE FROM departments WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Department deleted successfully' });
    });
});

// --- Levels ---
router.get('/levels', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM levels`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- Courses ---
router.get('/courses', authenticateToken, (req, res) => {
    db.all(`SELECT c.*, d.name as department_name, l.name as level_name 
            FROM courses c 
            JOIN departments d ON c.department_id = d.id 
            JOIN levels l ON c.level_id = l.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/courses', authenticateToken, authorizePermission('MANAGE_ACADEMIC'), (req, res) => {
    const { name, code, department_id, level_id } = req.body;
    db.run(`INSERT INTO courses (name, code, department_id, level_id) VALUES (?, ?, ?, ?)`, 
        [name, code, department_id, level_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Course created successfully' });
    });
});

router.put('/courses/:id', authenticateToken, authorizePermission('MANAGE_ACADEMIC'), (req, res) => {
    const { name, code, department_id, level_id } = req.body;
    db.run(`UPDATE courses SET name = ?, code = ?, department_id = ?, level_id = ? WHERE id = ?`, 
        [name, code, department_id, level_id, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course updated successfully' });
    });
});

router.delete('/courses/:id', authenticateToken, authorizePermission('MANAGE_ACADEMIC'), (req, res) => {
    db.run(`DELETE FROM courses WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course deleted successfully' });
    });
});

module.exports = router;
