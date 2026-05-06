const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    console.log('--- Starting Admin Seeding ---');
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@KogiPoly2024', salt);
        
        // Find ADMIN role ID
        db.get("SELECT id FROM roles WHERE name = 'ADMIN'", [], (err, role) => {
            if (err) {
                console.error('Error finding admin role:', err.message);
                return;
            }
            
            if (!role) {
                console.error('Admin role not found. Please ensure schema is initialized.');
                return;
            }
            
            const adminRoleId = role.id;
            
            // Check if admin already exists
            db.get("SELECT id FROM users WHERE username = 'admin'", [], (err, user) => {
                if (err) {
                    console.error('Error checking for existing admin:', err.message);
                    return;
                }
                
                if (user) {
                    console.log('Admin user already exists. Skipping seeding.');
                    return;
                }
                
                // Insert admin user
                db.run(
                    `INSERT INTO users (username, email, password_hash, role_id, full_name, is_active) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    ['admin', 'admin@kogipoly.edu.ng', hashedPassword, adminRoleId, 'System Administrator', 1],
                    function(err) {
                        if (err) {
                            console.error('Error seeding admin user:', err.message);
                        } else {
                            console.log('Admin user seeded successfully with username: admin');
                            
                            // Seed initial permissions for ADMIN role if not already done
                            db.all("SELECT id FROM permissions", [], (err, permissions) => {
                                if (err) return;
                                
                                permissions.forEach(p => {
                                    db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)", 
                                        [adminRoleId, p.id]);
                                });
                                console.log('Assigned all permissions to ADMIN role.');
                            });
                        }
                    }
                );
            });
        });
    } catch (err) {
        console.error('Seeding process failed:', err.message);
    }
}

// Small delay to ensure DB initialization from db.js is complete
setTimeout(seedAdmin, 1000);
