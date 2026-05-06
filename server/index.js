require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const securityRoutes = require('./routes/security');
const auditRoutes = require('./routes/audit');
const institutionalRoutes = require('./routes/institutional');
const roleRoutes = require('./routes/roles');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/institutional', institutionalRoutes);
app.use('/api/roles', roleRoutes);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Kogi Poly IAM System is running.' });
});

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle SPA routing - return index.html for any unknown routes
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
