const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'kogi_poly_secret_key';

// Authenticate JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// Check for specific roles (Legacy/Quick check)
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        db.get(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [req.user.id],
            (err, user) => {
                if (err || !user) return res.status(404).json({ message: 'User not found.' });
                
                if (!allowedRoles.includes(user.role_name)) {
                    return res.status(403).json({ message: 'Forbidden: Insufficient role.' });
                }
                
                req.dbUser = user;
                next();
            }
        );
    };
};

// Check for specific permissions (Dynamic PBAC)
const authorizePermission = (requiredPermission) => {
    return (req, res, next) => {
        db.get(
            `SELECT p.name 
             FROM users u 
             JOIN role_permissions rp ON u.role_id = rp.role_id 
             JOIN permissions p ON rp.permission_id = p.id 
             WHERE u.id = ? AND p.name = ?`,
            [req.user.id, requiredPermission],
            (err, permission) => {
                if (err) return res.status(500).json({ error: err.message });
                
                if (!permission) {
                    return res.status(403).json({ message: `Forbidden: Missing permission ${requiredPermission}` });
                }
                
                next();
            }
        );
    };
};

module.exports = { authenticateToken, authorizeRoles, authorizePermission, JWT_SECRET };
